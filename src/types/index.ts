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
  pointValue: PointTier;
  imageUrl: string;
  sellerId: string;
  sellerName: string;
  status: ItemStatus;
  createdAt: string;
  isStar: boolean;
  isLocalPickupOnly: boolean;
  ageRange?: string;
  size?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
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
}

export interface ClaimRecord {
  id: string;
  itemId: string;
  item: Item;
  claimerId: string;
  claimedAt: string;
  shippingFee?: number;
  status: "pending" | "shipped" | "received" | "flagged";
}

export interface FlagReport {
  id: string;
  itemId: string;
  reporterId: string;
  reason: string;
  createdAt: string;
}

export const TIER_INFO: Record<PointTier, { label: string; description: string; examples: string; color: string }> = {
  1: {
    label: "Basic",
    description: "Small items, often listed in bulk",
    examples: "Onesies, t-shirts, socks, bibs, hats, small toys",
    color: "bg-kidswap-teal",
  },
  5: {
    label: "Plus",
    description: "More valuable or specialized items",
    examples: "Winter boots, overalls, snowsuits, baby carriers, high-quality shoes",
    color: "bg-kidswap-purple",
  },
  10: {
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
