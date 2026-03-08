export type PointTier = 1 | 5 | 10;

export type ItemCategory = "clothing" | "gear" | "toys" | "shoes" | "accessories" | "outdoor" | "furniture" | "other";

export type ItemCondition = "like-new" | "good" | "fair";

export type ItemStatus = "available" | "claimed" | "shipped" | "received" | "flagged";

export interface Item {
  id: string;
  title: string;
  description: string;
  category: ItemCategory;
  condition: ItemCondition;
  pointValue: number;
  imageUrls: string[];
  sellerId: string;
  sellerName: string;
  status: ItemStatus;
  createdAt: string;
  isStar: boolean;
  isLocalPickupOnly: boolean;
  ageRange?: string;
  size?: string;
  tier: "bundle" | "plus" | "star";
  bundleItems?: BundleItem[];
}

export interface BundleItem {
  id: string;
  name: string;
  points: number;
}

export interface UserProfile {
  id: string;
  name: string;
  firstName: string;
  avatar: string;
  email: string;
  phone: string;
  address: string;
  points: number;
  totalEarned: number;
  totalSpent: number;
  itemsListed: number;
  itemsClaimed: number;
  starClaimsUsed: number;
  starClaimLimit: number;
  lastStarClaimReset: string;
  bonusStarClaims: number;
  hasCompletedOnboarding: boolean;
  joinedAt: string;
  flagsReceived: number;
  warnings: number;
  isSuspended: boolean;
  qualityWarnings: number;
  shippingWarnings: number;
}

export interface ClaimRecord {
  id: string;
  itemId: string;
  item: Item;
  claimerId: string;
  claimedAt: string;
  shippingFee?: number;
  status: "pending" | "shipped" | "received" | "flagged" | "completed";
  deadline: string; // 1 month from claim date
  // Claimer rating of items
  qualityRating?: number; // 1-5 overall
  individualRatings?: { itemName: string; rating: number }[];
  qualityComment?: string;
  claimerDone: boolean;
  // Lister/sender feedback
  listerDone: boolean;
  shippingReimbursed?: boolean;
  exchangeRespectful?: boolean;
  listerComment?: string;
  // Seller contact info revealed on claim
  sellerFirstName?: string;
  sellerPhone?: string;
}

export interface FlagReport {
  id: string;
  itemId: string;
  reporterId: string;
  reason: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  claimId: string;
  type: "low-quality" | "disrespectful-exchange";
  description: string;
  createdAt: string;
  status: "pending" | "reviewed";
}

// Predefined items users can pick from when listing
export const LISTABLE_ITEMS: { name: string; points: number; tier: "bundle" | "plus" | "star" }[] = [
  // Bundle items (1 pt each)
  { name: "T-shirt", points: 1, tier: "bundle" },
  { name: "Onesie", points: 1, tier: "bundle" },
  { name: "Pants", points: 1, tier: "bundle" },
  { name: "Shorts", points: 1, tier: "bundle" },
  { name: "Socks (pair)", points: 1, tier: "bundle" },
  { name: "Hat", points: 1, tier: "bundle" },
  { name: "Bib", points: 1, tier: "bundle" },
  { name: "Mittens", points: 1, tier: "bundle" },
  { name: "Small toy", points: 1, tier: "bundle" },
  { name: "Board book", points: 1, tier: "bundle" },
  { name: "Leggings", points: 1, tier: "bundle" },
  { name: "Sweater", points: 2, tier: "bundle" },
  { name: "Dress", points: 2, tier: "bundle" },
  { name: "Jacket (light)", points: 2, tier: "bundle" },
  { name: "Overalls", points: 2, tier: "bundle" },
  { name: "Romper", points: 1, tier: "bundle" },
  // Plus items (5 pts each — listed individually)
  { name: "Winter boots", points: 5, tier: "plus" },
  { name: "Snowsuit", points: 5, tier: "plus" },
  { name: "Baby carrier", points: 5, tier: "plus" },
  { name: "Quality shoes", points: 5, tier: "plus" },
  { name: "Rain gear set", points: 5, tier: "plus" },
  { name: "Highchair", points: 5, tier: "plus" },
  { name: "Playpen", points: 5, tier: "plus" },
  { name: "Baby monitor", points: 5, tier: "plus" },
  // Star items (10 pts each — listed individually, local pickup only)
  { name: "Stroller", points: 10, tier: "star" },
  { name: "Car seat", points: 10, tier: "star" },
  { name: "Crib", points: 10, tier: "star" },
  { name: "Ski set", points: 10, tier: "star" },
  { name: "Bike trailer", points: 10, tier: "star" },
  { name: "Changing table", points: 10, tier: "star" },
  { name: "Rocking chair", points: 10, tier: "star" },
];

export const TIER_INFO: Record<string, { label: string; description: string; examples: string; color: string }> = {
  bundle: {
    label: "Bundle",
    description: "Multiple small items bundled together (min 5 pts)",
    examples: "Onesies, t-shirts, socks, bibs, hats, small toys",
    color: "bg-kidswap-teal",
  },
  plus: {
    label: "Plus",
    description: "More valuable or specialized single items",
    examples: "Winter boots, snowsuits, baby carriers, quality shoes",
    color: "bg-kidswap-purple",
  },
  star: {
    label: "Star",
    description: "Large, high-value items — local pickup only",
    examples: "Strollers, car seats, cribs, skis, bike trailers",
    color: "bg-kidswap-pink",
  },
};

export const CATEGORIES: { value: ItemCategory; label: string; emoji: string }[] = [
  { value: "clothing", label: "Clothing", emoji: "👕" },
  { value: "shoes", label: "Shoes", emoji: "👟" },
  { value: "gear", label: "Baby Gear", emoji: "🍼" },
  { value: "toys", label: "Toys", emoji: "🧸" },
  { value: "outdoor", label: "Outdoor", emoji: "⛷️" },
  { value: "furniture", label: "Furniture", emoji: "🪑" },
  { value: "accessories", label: "Accessories", emoji: "🎒" },
  { value: "other", label: "Other", emoji: "📦" },
];
