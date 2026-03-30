import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Item, UserProfile, ClaimRecord, FlagReport, SupportTicket } from "@/types";
import { supabase } from "@/lib/supabase";
import * as db from "@/services/supabaseService";

interface AppState {
  user: UserProfile;
  items: Item[];
  claims: ClaimRecord[];
  flags: FlagReport[];
  supportTickets: SupportTicket[];

  // Whether we're connected to Supabase (auth'd)
  isOnline: boolean;
  setIsOnline: (v: boolean) => void;

  // Auth integration
  initializeFromAuth: (userId: string, email: string, firstName: string) => void;
  logout: () => void;

  // Sync helpers
  loadItemsFromDb: () => Promise<void>;
  loadProfileFromDb: () => Promise<void>;
  loadClaimsFromDb: () => Promise<void>;

  // User actions
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  addPoints: (amount: number) => void;
  spendPoints: (amount: number) => boolean;
  updateUser: (updates: Partial<UserProfile>) => void;

  // Item actions
  addItem: (item: Item) => void;
  addItemWithPhotos: (item: Item, files: File[]) => Promise<void>;
  removeItem: (id: string) => void;
  updateItemStatus: (id: string, status: Item["status"]) => void;

  // Claim actions
  claimItem: (item: Item) => boolean;
  addClaim: (claim: ClaimRecord) => void;
  updateClaimStatus: (id: string, status: ClaimRecord["status"]) => void;
  completeClaimAsClaimant: (claimId: string, overallRating?: number, individualRatings?: { itemName: string; rating: number }[], comment?: string) => void;
  completeClaimAsLister: (claimId: string, shippingReimbursed: boolean, exchangeRespectful: boolean, comment?: string) => void;

  // Flag actions
  flagItem: (itemId: string, reason: string) => void;

  // Support tickets
  addSupportTicket: (ticket: SupportTicket) => void;

  // Star claim helpers
  canClaimStarItem: () => boolean;
  getStarClaimsRemaining: () => number;

  // Seller lookup helpers
  getSellerProfile: (sellerId: string) => { firstName: string; phone: string } | null;
}

const defaultUser: UserProfile = {
  id: "user-1",
  name: "Parent",
  firstName: "",
  avatar: "",
  email: "",
  phone: "",
  address: "",
  points: 5,
  totalEarned: 5,
  totalSpent: 0,
  itemsListed: 0,
  itemsClaimed: 0,
  starClaimsUsed: 0,
  starClaimLimit: 1,
  lastStarClaimReset: new Date().toISOString(),
  bonusStarClaims: 0,
  hasCompletedOnboarding: false,
  joinedAt: new Date().toISOString(),
  flagsReceived: 0,
  warnings: 0,
  isSuspended: false,
  qualityWarnings: 0,
  shippingWarnings: 0,
};

// Simulated seller profiles for demo/offline mode
const sellerProfiles: Record<string, { firstName: string; phone: string; email: string }> = {
  "seller-1": { firstName: "Sarah", phone: "+1 555-0101", email: "sarah@example.com" },
  "seller-2": { firstName: "Mike", phone: "+1 555-0102", email: "mike@example.com" },
  "seller-3": { firstName: "Lisa", phone: "+1 555-0103", email: "lisa@example.com" },
  "seller-4": { firstName: "Jen", phone: "+1 555-0104", email: "jen@example.com" },
  "seller-5": { firstName: "Dave", phone: "+1 555-0105", email: "dave@example.com" },
};

const FOUR_MONTHS_MS = 4 * 30 * 24 * 60 * 60 * 1000;
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

function checkAndResetStarWindow(user: UserProfile): UserProfile {
  const lastReset = new Date(user.lastStarClaimReset).getTime();
  const now = Date.now();
  if (now - lastReset > FOUR_MONTHS_MS) {
    return {
      ...user,
      starClaimsUsed: 0,
      bonusStarClaims: 0,
      lastStarClaimReset: new Date().toISOString(),
    };
  }
  return user;
}

/** Persist profile changes to Supabase in the background */
function syncProfile(state: AppState) {
  if (state.isOnline && state.user.id !== "user-1") {
    db.updateProfile(state.user.id, state.user).catch(() => {
      // Silently fail — localStorage has the data
    });
  }
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: defaultUser,
      items: generateSampleItems(),
      claims: [],
      flags: [],
      supportTickets: [],
      isOnline: false,

      setIsOnline: (v) => set({ isOnline: v }),

      // ── Auth integration ───────────────────────────────────
      initializeFromAuth: (userId, email, firstName) => {
        const state = get();
        // Already initialized for this user
        if (state.user.id === userId) return;

        // Set up user profile with auth data
        set({
          user: {
            ...defaultUser,
            id: userId,
            email,
            firstName,
            name: firstName || "Parent",
            hasCompletedOnboarding: state.user.id === userId ? state.user.hasCompletedOnboarding : false,
          },
          isOnline: true,
        });

        // Load profile from Supabase (will merge server data if it exists)
        get().loadProfileFromDb();
        get().loadItemsFromDb();
        get().loadClaimsFromDb();
      },

      logout: () => {
        set({
          user: defaultUser,
          claims: [],
          flags: [],
          supportTickets: [],
          isOnline: false,
          items: generateSampleItems(),
        });
      },

      // ── Sync from DB ───────────────────────────────────────
      loadItemsFromDb: async () => {
        try {
          const items = await db.fetchItems();
          if (items.length > 0) {
            set({ items });
          }
        } catch {
          // Stay with localStorage data
        }
      },

      loadProfileFromDb: async () => {
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (!authUser) return;
          const profile = await db.fetchProfile(authUser.id);
          if (profile) {
            set({ user: profile, isOnline: true });
          }
        } catch {
          // Stay with localStorage data
        }
      },

      loadClaimsFromDb: async () => {
        try {
          const state = get();
          if (!state.isOnline || state.user.id === "user-1") return;
          const claims = await db.fetchClaimsForUser(state.user.id);
          if (claims.length > 0) {
            set({ claims });
          }
        } catch {
          // Stay with localStorage data
        }
      },

      // ── User actions ───────────────────────────────────────
      completeOnboarding: () =>
        set((state) => {
          const newState = { user: { ...state.user, hasCompletedOnboarding: true } };
          syncProfile({ ...state, ...newState });
          return newState;
        }),

      resetOnboarding: () =>
        set((state) => ({
          user: { ...state.user, hasCompletedOnboarding: false },
        })),

      addPoints: (amount) =>
        set((state) => {
          const newState = {
            user: {
              ...state.user,
              points: state.user.points + amount,
              totalEarned: state.user.totalEarned + amount,
            },
          };
          syncProfile({ ...state, ...newState });
          return newState;
        }),

      spendPoints: (amount) => {
        const { user } = get();
        if (user.points < amount) return false;
        set((state) => {
          const newState = {
            user: {
              ...state.user,
              points: state.user.points - amount,
              totalSpent: state.user.totalSpent + amount,
            },
          };
          syncProfile({ ...state, ...newState });
          return newState;
        });
        return true;
      },

      updateUser: (updates) =>
        set((state) => {
          const newState = { user: { ...state.user, ...updates } };
          syncProfile({ ...state, ...newState });
          return newState;
        }),

      // ── Item actions ───────────────────────────────────────
      addItem: (item) =>
        set((state) => {
          const newUser = {
            ...state.user,
            points: state.user.points + item.pointValue,
            totalEarned: state.user.totalEarned + item.pointValue,
            itemsListed: state.user.itemsListed + 1,
            bonusStarClaims:
              item.isStar
                ? state.user.bonusStarClaims + 1
                : state.user.bonusStarClaims,
          };

          // Persist to Supabase in background
          if (state.isOnline && state.user.id !== "user-1") {
            db.insertItem(item).catch(() => {});
            db.updateProfile(state.user.id, newUser).catch(() => {});
          }

          return { items: [item, ...state.items], user: newUser };
        }),

      addItemWithPhotos: async (item, files) => {
        const state = get();
        let imageUrls = item.imageUrls;

        // Upload photos to Supabase Storage if online
        if (state.isOnline && state.user.id !== "user-1" && files.length > 0) {
          const urls = await Promise.all(
            files.map((file) => db.uploadItemPhoto(file, state.user.id))
          );
          imageUrls = urls;
        }

        const finalItem = { ...item, imageUrls };
        get().addItem(finalItem);
      },

      removeItem: (id) =>
        set((state) => {
          if (state.isOnline && state.user.id !== "user-1") {
            db.deleteItem(id).catch(() => {});
          }
          return { items: state.items.filter((i) => i.id !== id) };
        }),

      updateItemStatus: (id, status) =>
        set((state) => {
          if (state.isOnline && state.user.id !== "user-1") {
            db.updateItem(id, { status }).catch(() => {});
          }
          return {
            items: state.items.map((i) => (i.id === id ? { ...i, status } : i)),
          };
        }),

      // ── Claim actions ──────────────────────────────────────
      claimItem: (item) => {
        const state = get();
        let user = checkAndResetStarWindow(state.user);

        if (user.isSuspended) return false;
        if (user.points < item.pointValue) return false;

        if (item.isStar) {
          const totalAllowed = user.starClaimLimit + user.bonusStarClaims;
          if (user.starClaimsUsed >= totalAllowed) return false;
          user = { ...user, starClaimsUsed: user.starClaimsUsed + 1 };
        }

        user = {
          ...user,
          points: user.points - item.pointValue,
          totalSpent: user.totalSpent + item.pointValue,
          itemsClaimed: user.itemsClaimed + 1,
        };

        const sellerInfo = sellerProfiles[item.sellerId];
        const deadline = new Date(Date.now() + ONE_MONTH_MS).toISOString();

        const claim: ClaimRecord = {
          id: `claim-${Date.now()}`,
          itemId: item.id,
          item,
          claimerId: user.id,
          claimedAt: new Date().toISOString(),
          shippingFee: item.isStar ? undefined : 5.99,
          status: "pending",
          deadline,
          claimerDone: false,
          listerDone: false,
          sellerFirstName: sellerInfo?.firstName || item.sellerName.split(" ")[0],
          sellerPhone: sellerInfo?.phone || "+1 555-0000",
        };

        // Persist to Supabase
        if (state.isOnline && user.id !== "user-1") {
          db.insertClaim(claim).catch(() => {});
          db.updateItem(item.id, { status: "claimed" }).catch(() => {});
          db.updateProfile(user.id, user).catch(() => {});
        }

        set({
          user,
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, status: "claimed" } : i
          ),
          claims: [claim, ...state.claims],
        });

        return true;
      },

      addClaim: (claim) =>
        set((state) => ({ claims: [claim, ...state.claims] })),

      updateClaimStatus: (id, status) =>
        set((state) => {
          if (state.isOnline && state.user.id !== "user-1") {
            db.updateClaim(id, { status }).catch(() => {});
          }
          return {
            claims: state.claims.map((c) =>
              c.id === id ? { ...c, status } : c
            ),
          };
        }),

      completeClaimAsClaimant: (claimId, overallRating, individualRatings, comment) =>
        set((state) => {
          const claim = state.claims.find((c) => c.id === claimId);
          if (!claim) return state;

          let newTickets = [...state.supportTickets];

          if (overallRating !== undefined && overallRating < 3) {
            const ticket: SupportTicket = {
              id: `ticket-${Date.now()}`,
              claimId,
              type: "low-quality",
              description: comment || `Low quality rating: ${overallRating}/5`,
              createdAt: new Date().toISOString(),
              status: "pending",
            };
            newTickets.push(ticket);
            if (state.isOnline && state.user.id !== "user-1") {
              db.insertSupportTicket(ticket).catch(() => {});
            }
          }

          const updatedClaim: ClaimRecord = {
            ...claim,
            qualityRating: overallRating,
            individualRatings,
            qualityComment: comment,
            claimerDone: true,
            status: claim.listerDone ? "completed" : claim.status,
          };

          if (state.isOnline && state.user.id !== "user-1") {
            db.updateClaim(claimId, {
              quality_rating: overallRating,
              individual_ratings: individualRatings,
              quality_comment: comment,
              claimer_done: true,
              status: updatedClaim.status,
            }).catch(() => {});
          }

          return {
            claims: state.claims.map((c) =>
              c.id === claimId ? updatedClaim : c
            ),
            supportTickets: newTickets,
          };
        }),

      completeClaimAsLister: (claimId, shippingReimbursed, exchangeRespectful, comment) =>
        set((state) => {
          const claim = state.claims.find((c) => c.id === claimId);
          if (!claim) return state;

          let updatedUser = { ...state.user };
          let newTickets = [...state.supportTickets];

          if (!shippingReimbursed) {
            updatedUser = {
              ...updatedUser,
              points: updatedUser.points + 3,
              totalEarned: updatedUser.totalEarned + 3,
            };
          }

          if (!exchangeRespectful) {
            const ticket: SupportTicket = {
              id: `ticket-${Date.now()}`,
              claimId,
              type: "disrespectful-exchange",
              description: comment || "Exchange was not conducted respectfully",
              createdAt: new Date().toISOString(),
              status: "pending",
            };
            newTickets.push(ticket);
            if (state.isOnline && state.user.id !== "user-1") {
              db.insertSupportTicket(ticket).catch(() => {});
            }
          }

          const updatedClaim: ClaimRecord = {
            ...claim,
            listerDone: true,
            shippingReimbursed,
            exchangeRespectful,
            listerComment: comment,
            status: claim.claimerDone ? "completed" : claim.status,
          };

          if (state.isOnline && state.user.id !== "user-1") {
            db.updateClaim(claimId, {
              lister_done: true,
              shipping_reimbursed: shippingReimbursed,
              exchange_respectful: exchangeRespectful,
              lister_comment: comment,
              status: updatedClaim.status,
            }).catch(() => {});
            db.updateProfile(state.user.id, updatedUser).catch(() => {});
          }

          return {
            user: updatedUser,
            claims: state.claims.map((c) =>
              c.id === claimId ? updatedClaim : c
            ),
            supportTickets: newTickets,
          };
        }),

      // ── Flags ──────────────────────────────────────────────
      flagItem: (itemId, reason) =>
        set((state) => {
          const item = state.items.find((i) => i.id === itemId);
          if (!item) return state;

          const flag: FlagReport = {
            id: `flag-${Date.now()}`,
            itemId,
            reporterId: state.user.id,
            reason,
            createdAt: new Date().toISOString(),
          };

          if (state.isOnline && state.user.id !== "user-1") {
            db.insertFlag(flag).catch(() => {});
            db.updateItem(itemId, { status: "flagged" }).catch(() => {});
          }

          return {
            flags: [flag, ...state.flags],
            items: state.items.map((i) =>
              i.id === itemId ? { ...i, status: "flagged" as const } : i
            ),
          };
        }),

      addSupportTicket: (ticket) =>
        set((state) => {
          if (state.isOnline && state.user.id !== "user-1") {
            db.insertSupportTicket(ticket).catch(() => {});
          }
          return { supportTickets: [ticket, ...state.supportTickets] };
        }),

      // ── Star claim helpers ─────────────────────────────────
      canClaimStarItem: () => {
        const user = checkAndResetStarWindow(get().user);
        const totalAllowed = user.starClaimLimit + user.bonusStarClaims;
        return user.starClaimsUsed < totalAllowed;
      },

      getStarClaimsRemaining: () => {
        const user = checkAndResetStarWindow(get().user);
        const totalAllowed = user.starClaimLimit + user.bonusStarClaims;
        return Math.max(0, totalAllowed - user.starClaimsUsed);
      },

      getSellerProfile: (sellerId) => {
        const profile = sellerProfiles[sellerId];
        if (profile) return { firstName: profile.firstName, phone: profile.phone };
        const user = get().user;
        if (sellerId === user.id) return { firstName: user.firstName || user.name, phone: user.phone };
        return null;
      },
    }),
    {
      name: "kidswap-store",
      partialize: (state) => ({
        user: state.user,
        items: state.items,
        claims: state.claims,
        flags: state.flags,
        supportTickets: state.supportTickets,
      }),
    }
  )
);

function generateSampleItems(): Item[] {
  return [
    {
      id: "sample-1",
      title: "Baby Onesies Bundle (5 pieces)",
      description: "Assorted colors, size 0-3 months. Gently used, no stains.",
      category: "clothing",
      condition: "good",
      pointValue: 5,
      imageUrls: ["https://images.unsplash.com/photo-1522771930-78848d9293e8?w=400&h=300&fit=crop"],
      sellerId: "seller-1",
      sellerName: "Sarah M.",
      status: "available",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      isStar: false,
      isLocalPickupOnly: false,
      ageRange: "0-3 months",
      size: "Newborn",
      tier: "bundle",
      bundleItems: [
        { id: "b1", name: "Onesie", points: 1 },
        { id: "b2", name: "Onesie", points: 1 },
        { id: "b3", name: "Onesie", points: 1 },
        { id: "b4", name: "Onesie", points: 1 },
        { id: "b5", name: "Onesie", points: 1 },
      ],
    },
    {
      id: "sample-2",
      title: "Kids T-Shirts & Pants Bundle",
      description: "Fun dinosaur prints, size 3T. Great condition!",
      category: "clothing",
      condition: "like-new",
      pointValue: 5,
      imageUrls: ["https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&h=300&fit=crop"],
      sellerId: "seller-2",
      sellerName: "Mike R.",
      status: "available",
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      isStar: false,
      isLocalPickupOnly: false,
      ageRange: "2-3 years",
      size: "3T",
      tier: "bundle",
      bundleItems: [
        { id: "b6", name: "T-shirt", points: 1 },
        { id: "b7", name: "T-shirt", points: 1 },
        { id: "b8", name: "T-shirt", points: 1 },
        { id: "b9", name: "Pants", points: 1 },
        { id: "b10", name: "Pants", points: 1 },
      ],
    },
    {
      id: "sample-3",
      title: "Winter Snow Boots",
      description: "Sorel brand, size 10 toddler. Waterproof, warm lining. Used one season.",
      category: "shoes",
      condition: "good",
      pointValue: 5,
      imageUrls: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop"],
      sellerId: "seller-3",
      sellerName: "Lisa K.",
      status: "available",
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      isStar: false,
      isLocalPickupOnly: false,
      ageRange: "2-4 years",
      size: "10 Toddler",
      tier: "plus",
    },
    {
      id: "sample-4",
      title: "Ergobaby Baby Carrier",
      description: "Omni 360 model, all positions. Clean, fully functional. Includes infant insert.",
      category: "gear",
      condition: "good",
      pointValue: 5,
      imageUrls: ["https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&h=300&fit=crop"],
      sellerId: "seller-1",
      sellerName: "Sarah M.",
      status: "available",
      createdAt: new Date(Date.now() - 345600000).toISOString(),
      isStar: false,
      isLocalPickupOnly: false,
      ageRange: "0-4 years",
      tier: "plus",
    },
    {
      id: "sample-5",
      title: "UPPAbaby Vista Stroller",
      description: "2022 model, charcoal color. Excellent condition with bassinet attachment. Local pickup only.",
      category: "gear",
      condition: "like-new",
      pointValue: 10,
      imageUrls: ["https://images.unsplash.com/photo-1586105251261-72a756497a31?w=400&h=300&fit=crop"],
      sellerId: "seller-4",
      sellerName: "Jen W.",
      status: "available",
      createdAt: new Date(Date.now() - 432000000).toISOString(),
      isStar: true,
      isLocalPickupOnly: true,
      ageRange: "0-3 years",
      tier: "star",
    },
    {
      id: "sample-6",
      title: "Graco 4Ever Car Seat",
      description: "4-in-1 convertible. No accidents, expires 2028. All manuals included.",
      category: "gear",
      condition: "good",
      pointValue: 10,
      imageUrls: ["https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=300&fit=crop"],
      sellerId: "seller-5",
      sellerName: "Dave P.",
      status: "available",
      createdAt: new Date(Date.now() - 518400000).toISOString(),
      isStar: true,
      isLocalPickupOnly: true,
      ageRange: "0-10 years",
      tier: "star",
    },
    {
      id: "sample-7",
      title: "LEGO Duplo & Small Toys Bundle",
      description: "Large box of mixed Duplo blocks, ~100 pieces plus small figurines. Clean and complete.",
      category: "toys",
      condition: "good",
      pointValue: 5,
      imageUrls: ["https://images.unsplash.com/photo-1587654780291-39c9404d7dd0?w=400&h=300&fit=crop"],
      sellerId: "seller-2",
      sellerName: "Mike R.",
      status: "available",
      createdAt: new Date(Date.now() - 604800000).toISOString(),
      isStar: false,
      isLocalPickupOnly: false,
      ageRange: "1-5 years",
      tier: "bundle",
      bundleItems: [
        { id: "b11", name: "Small toy", points: 1 },
        { id: "b12", name: "Small toy", points: 1 },
        { id: "b13", name: "Small toy", points: 1 },
        { id: "b14", name: "Small toy", points: 1 },
        { id: "b15", name: "Small toy", points: 1 },
      ],
    },
    {
      id: "sample-8",
      title: "Kids Ski Set",
      description: "90cm skis, size 11 boots, matching poles. Perfect starter set. Used 2 seasons.",
      category: "outdoor",
      condition: "good",
      pointValue: 10,
      imageUrls: ["https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop"],
      sellerId: "seller-3",
      sellerName: "Lisa K.",
      status: "available",
      createdAt: new Date(Date.now() - 691200000).toISOString(),
      isStar: true,
      isLocalPickupOnly: true,
      ageRange: "4-6 years",
      tier: "star",
    },
    {
      id: "sample-9",
      title: "Baby Snowsuit",
      description: "Columbia brand, size 18 months. Warm and waterproof. Like new.",
      category: "clothing",
      condition: "like-new",
      pointValue: 5,
      imageUrls: ["https://images.unsplash.com/photo-1604467707321-70d009801bf0?w=400&h=300&fit=crop"],
      sellerId: "seller-5",
      sellerName: "Dave P.",
      status: "available",
      createdAt: new Date(Date.now() - 777600000).toISOString(),
      isStar: false,
      isLocalPickupOnly: false,
      ageRange: "12-24 months",
      size: "18M",
      tier: "plus",
    },
    {
      id: "sample-10",
      title: "Cotton Toddler Dresses & Rompers",
      description: "Cute summer dresses and rompers, size 2T. Various patterns. No stains or tears.",
      category: "clothing",
      condition: "good",
      pointValue: 6,
      imageUrls: ["https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400&h=300&fit=crop"],
      sellerId: "seller-4",
      sellerName: "Jen W.",
      status: "available",
      createdAt: new Date(Date.now() - 864000000).toISOString(),
      isStar: false,
      isLocalPickupOnly: false,
      ageRange: "1-2 years",
      size: "2T",
      tier: "bundle",
      bundleItems: [
        { id: "b16", name: "Dress", points: 2 },
        { id: "b17", name: "Dress", points: 2 },
        { id: "b18", name: "Romper", points: 1 },
        { id: "b19", name: "Romper", points: 1 },
      ],
    },
  ];
}
