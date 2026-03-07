import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Item, UserProfile, ClaimRecord, FlagReport } from "@/types";

interface AppState {
  user: UserProfile;
  items: Item[];
  claims: ClaimRecord[];
  flags: FlagReport[];

  // User actions
  completeOnboarding: () => void;
  addPoints: (amount: number) => void;
  spendPoints: (amount: number) => boolean;
  updateUser: (updates: Partial<UserProfile>) => void;

  // Item actions
  addItem: (item: Item) => void;
  removeItem: (id: string) => void;
  updateItemStatus: (id: string, status: Item["status"]) => void;

  // Claim actions
  claimItem: (item: Item) => boolean;
  addClaim: (claim: ClaimRecord) => void;
  updateClaimStatus: (id: string, status: ClaimRecord["status"]) => void;

  // Flag actions
  flagItem: (itemId: string, reason: string) => void;

  // Star claim helpers
  canClaimStarItem: () => boolean;
  getStarClaimsRemaining: () => number;
}

const defaultUser: UserProfile = {
  id: "user-1",
  name: "Parent",
  avatar: "",
  points: 5,
  totalEarned: 5,
  totalSpent: 0,
  itemsListed: 0,
  itemsClaimed: 0,
  starClaimsUsed: 0,
  starClaimLimit: 1,
  lastStarClaimReset: new Date().toISOString(),
  bonusStarClaims: 0,
  plusItemsListedSinceLastBonus: 0,
  hasCompletedOnboarding: false,
  joinedAt: new Date().toISOString(),
  flagsReceived: 0,
};

const FOUR_MONTHS_MS = 4 * 30 * 24 * 60 * 60 * 1000;

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

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: defaultUser,
      items: generateSampleItems(),
      claims: [],
      flags: [],

      completeOnboarding: () =>
        set((state) => ({
          user: { ...state.user, hasCompletedOnboarding: true },
        })),

      addPoints: (amount) =>
        set((state) => ({
          user: {
            ...state.user,
            points: state.user.points + amount,
            totalEarned: state.user.totalEarned + amount,
          },
        })),

      spendPoints: (amount) => {
        const { user } = get();
        if (user.points < amount) return false;
        set((state) => ({
          user: {
            ...state.user,
            points: state.user.points - amount,
            totalSpent: state.user.totalSpent + amount,
          },
        }));
        return true;
      },

      updateUser: (updates) =>
        set((state) => ({
          user: { ...state.user, ...updates },
        })),

      addItem: (item) =>
        set((state) => {
          // Calculate total points for the bundle
          const totalPoints = item.bundlePointBreakdown
            ? item.bundlePointBreakdown.reduce((sum, b) => sum + b.tier * b.count, 0)
            : item.pointValue;

          let bonusStarClaims = state.user.bonusStarClaims;
          let plusCount = state.user.plusItemsListedSinceLastBonus;

          if (item.isStar) {
            // Listing a star item earns 1 bonus star claim
            bonusStarClaims += 1;
          }

          // Count plus items in this bundle
          if (item.bundlePointBreakdown) {
            const plusInBundle = item.bundlePointBreakdown
              .filter((b) => b.tier === 5)
              .reduce((sum, b) => sum + b.count, 0);
            plusCount += plusInBundle;
          } else if (item.pointValue === 5) {
            plusCount += 1;
          }

          // Every 2 plus items listed earns 1 bonus star claim
          const newBonusFromPlus = Math.floor(plusCount / 2);
          bonusStarClaims += newBonusFromPlus;
          plusCount = plusCount % 2;

          const newUser = {
            ...state.user,
            points: state.user.points + totalPoints,
            totalEarned: state.user.totalEarned + totalPoints,
            itemsListed: state.user.itemsListed + 1,
            bonusStarClaims,
            plusItemsListedSinceLastBonus: plusCount,
          };
          return { items: [item, ...state.items], user: newUser };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      updateItemStatus: (id, status) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, status } : i)),
        })),

      claimItem: (item) => {
        const state = get();
        let user = checkAndResetStarWindow(state.user);

        const totalPoints = item.bundlePointBreakdown
          ? item.bundlePointBreakdown.reduce((sum, b) => sum + b.tier * b.count, 0)
          : item.pointValue;

        if (user.points < totalPoints) return false;

        if (item.isStar) {
          const totalAllowed = user.starClaimLimit + user.bonusStarClaims;
          if (user.starClaimsUsed >= totalAllowed) return false;
          user = { ...user, starClaimsUsed: user.starClaimsUsed + 1 };
        }

        user = {
          ...user,
          points: user.points - totalPoints,
          totalSpent: user.totalSpent + totalPoints,
          itemsClaimed: user.itemsClaimed + 1,
        };

        const claim: ClaimRecord = {
          id: `claim-${Date.now()}`,
          itemId: item.id,
          item,
          claimerId: user.id,
          claimedAt: new Date().toISOString(),
          shippingFee: item.isStar ? undefined : 5.99,
          status: "pending",
        };

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
        set((state) => ({
          claims: state.claims.map((c) =>
            c.id === id ? { ...c, status } : c
          ),
        })),

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

          return {
            flags: [flag, ...state.flags],
            items: state.items.map((i) =>
              i.id === itemId ? { ...i, status: "flagged" as const } : i
            ),
          };
        }),

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
    }),
    {
      name: "kidswap-store",
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
      pointValue: 1,
      imageUrl: "",
      sellerId: "seller-1",
      sellerName: "Sarah M.",
      status: "available",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      isStar: false,
      isLocalPickupOnly: false,
      ageRange: "0-3 months",
      size: "Newborn",
      bundleType: "basic",
      bundleItemCount: 5,
      bundleTags: ["baby-essentials", "unisex", "0-6m"],
      bundlePointBreakdown: [{ tier: 1, count: 5 }],
    },
    {
      id: "sample-2",
      title: "Kids T-Shirts (3 pack)",
      description: "Fun dinosaur prints, size 3T. Great condition!",
      category: "clothing",
      condition: "like-new",
      pointValue: 1,
      imageUrl: "",
      sellerId: "seller-2",
      sellerName: "Mike R.",
      status: "available",
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      isStar: false,
      isLocalPickupOnly: false,
      ageRange: "2-3 years",
      size: "3T",
    },
    {
      id: "sample-3",
      title: "Winter Snow Boots",
      description: "Sorel brand, size 10 toddler. Waterproof, warm lining. Used one season.",
      category: "shoes",
      condition: "good",
      pointValue: 5,
      imageUrl: "",
      sellerId: "seller-3",
      sellerName: "Lisa K.",
      status: "available",
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      isStar: false,
      isLocalPickupOnly: false,
      ageRange: "2-4 years",
      size: "10 Toddler",
    },
    {
      id: "sample-4",
      title: "Ergobaby Baby Carrier",
      description: "Omni 360 model, all positions. Clean, fully functional. Includes infant insert.",
      category: "gear",
      condition: "good",
      pointValue: 5,
      imageUrl: "",
      sellerId: "seller-1",
      sellerName: "Sarah M.",
      status: "available",
      createdAt: new Date(Date.now() - 345600000).toISOString(),
      isStar: false,
      isLocalPickupOnly: false,
      ageRange: "0-4 years",
    },
    {
      id: "sample-5",
      title: "UPPAbaby Vista Stroller",
      description: "2022 model, charcoal color. Excellent condition with bassinet attachment. Local pickup only.",
      category: "gear",
      condition: "like-new",
      pointValue: 10,
      imageUrl: "",
      sellerId: "seller-4",
      sellerName: "Jen W.",
      status: "available",
      createdAt: new Date(Date.now() - 432000000).toISOString(),
      isStar: true,
      isLocalPickupOnly: true,
      ageRange: "0-3 years",
    },
    {
      id: "sample-6",
      title: "Graco 4Ever Car Seat",
      description: "4-in-1 convertible. No accidents, expires 2028. All manuals included.",
      category: "gear",
      condition: "good",
      pointValue: 10,
      imageUrl: "",
      sellerId: "seller-5",
      sellerName: "Dave P.",
      status: "available",
      createdAt: new Date(Date.now() - 518400000).toISOString(),
      isStar: true,
      isLocalPickupOnly: true,
      ageRange: "0-10 years",
    },
    {
      id: "sample-7",
      title: "LEGO Duplo Set",
      description: "Large box of mixed Duplo blocks, ~100 pieces. Clean and complete.",
      category: "toys",
      condition: "good",
      pointValue: 1,
      imageUrl: "",
      sellerId: "seller-2",
      sellerName: "Mike R.",
      status: "available",
      createdAt: new Date(Date.now() - 604800000).toISOString(),
      isStar: false,
      isLocalPickupOnly: false,
      ageRange: "1-5 years",
    },
    {
      id: "sample-8",
      title: "Kids Ski Set (skis + boots + poles)",
      description: "90cm skis, size 11 boots. Perfect starter set. Used 2 seasons.",
      category: "outdoor",
      condition: "good",
      pointValue: 10,
      imageUrl: "",
      sellerId: "seller-3",
      sellerName: "Lisa K.",
      status: "available",
      createdAt: new Date(Date.now() - 691200000).toISOString(),
      isStar: true,
      isLocalPickupOnly: true,
      ageRange: "4-6 years",
    },
    {
      id: "sample-9",
      title: "Baby Snowsuit",
      description: "Columbia brand, size 18 months. Warm and waterproof. Like new.",
      category: "clothing",
      condition: "like-new",
      pointValue: 5,
      imageUrl: "",
      sellerId: "seller-5",
      sellerName: "Dave P.",
      status: "available",
      createdAt: new Date(Date.now() - 777600000).toISOString(),
      isStar: false,
      isLocalPickupOnly: false,
      ageRange: "12-24 months",
      size: "18M",
    },
    {
      id: "sample-10",
      title: "Summer Toddler Girl Bundle (6 pieces)",
      description: "4 cotton dresses + 2 sun hats, size 2T. Various patterns. No stains or tears.",
      category: "clothing",
      condition: "good",
      pointValue: 1,
      imageUrl: "",
      sellerId: "seller-4",
      sellerName: "Jen W.",
      status: "available",
      createdAt: new Date(Date.now() - 864000000).toISOString(),
      isStar: false,
      isLocalPickupOnly: false,
      ageRange: "1-2 years",
      size: "2T",
      bundleType: "basic",
      bundleItemCount: 6,
      bundleTags: ["summer-fun", "girls", "1-2y"],
      bundlePointBreakdown: [{ tier: 1, count: 6 }],
    },
    {
      id: "sample-11",
      title: "Winter Play Mix Bundle",
      description: "Snow boots (5pts) + 5 warm layers: fleece jacket, snow pants, mittens, hat, scarf (1pt each). Perfect for toddler winter!",
      category: "clothing",
      condition: "good",
      pointValue: 5,
      imageUrl: "",
      sellerId: "seller-3",
      sellerName: "Lisa K.",
      status: "available",
      createdAt: new Date(Date.now() - 950400000).toISOString(),
      isStar: false,
      isLocalPickupOnly: false,
      ageRange: "2-4 years",
      size: "3T",
      bundleType: "mix",
      bundleItemCount: 6,
      bundleTags: ["winter-play", "unisex", "2-4y"],
      bundlePointBreakdown: [{ tier: 5, count: 1 }, { tier: 1, count: 5 }],
    },
  ];
}
