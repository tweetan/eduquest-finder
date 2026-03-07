export type PointTier = 1 | 5 | 10;

export type ItemCategory = "clothing" | "gear" | "toys" | "shoes" | "accessories" | "outdoor" | "furniture" | "other";

export type ItemCondition = "like-new" | "good" | "fair";

export type ItemStatus = "available" | "claimed" | "shipped" | "received" | "flagged";

export type BundleTag =
  | "winter-play"
  | "muddy-weather"
  | "summer-fun"
  | "rainy-days"
  | "snow-gear"
  | "beach-time"
  | "sports"
  | "baby-essentials"
  | "toddler-mix"
  | "school-ready"
  | "boys"
  | "girls"
  | "unisex"
  | "0-6m"
  | "6-12m"
  | "1-2y"
  | "2-4y"
  | "4-6y"
  | "6-8y"
  | "8-12y";

export type BundleType = "basic" | "plus" | "star" | "mix";

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
  bundleType?: BundleType;
  bundleItemCount?: number;
  bundleTags?: BundleTag[];
  bundlePointBreakdown?: { tier: PointTier; count: number }[];
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
  plusItemsListedSinceLastBonus: number;
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
    description: "1 point per item — bundle at least 5 items (= 5+ points)",
    examples: "Onesies, t-shirts, socks, bibs, hats, small toys",
    color: "bg-kidswap-teal",
  },
  5: {
    label: "Plus",
    description: "5 points per item — quality or specialized pieces",
    examples: "Winter boots, overalls, snowsuits, baby carriers, high-quality shoes",
    color: "bg-kidswap-purple",
  },
  10: {
    label: "Star",
    description: "10 points — large, high-value items — local pickup only",
    examples: "Strollers, car seats, cribs, skis, bike trailers",
    color: "bg-kidswap-pink",
  },
};

export const BUNDLE_TAG_INFO: Record<string, { label: string; emoji: string; group: "season" | "age" | "gender" }[]> = {
  season: [
    { label: "Winter Play", emoji: "❄️", group: "season" },
    { label: "Muddy Weather", emoji: "🌧️", group: "season" },
    { label: "Summer Fun", emoji: "☀️", group: "season" },
    { label: "Rainy Days", emoji: "🌂", group: "season" },
    { label: "Snow Gear", emoji: "⛷️", group: "season" },
    { label: "Beach Time", emoji: "🏖️", group: "season" },
    { label: "Sports", emoji: "⚽", group: "season" },
    { label: "Baby Essentials", emoji: "🍼", group: "season" },
    { label: "Toddler Mix", emoji: "🧒", group: "season" },
    { label: "School Ready", emoji: "🎒", group: "season" },
  ],
  gender: [
    { label: "Boys", emoji: "👦", group: "gender" },
    { label: "Girls", emoji: "👧", group: "gender" },
    { label: "Unisex", emoji: "🧒", group: "gender" },
  ],
  age: [
    { label: "0-6 months", emoji: "👶", group: "age" },
    { label: "6-12 months", emoji: "👶", group: "age" },
    { label: "1-2 years", emoji: "🧒", group: "age" },
    { label: "2-4 years", emoji: "🧒", group: "age" },
    { label: "4-6 years", emoji: "👦", group: "age" },
    { label: "6-8 years", emoji: "👧", group: "age" },
    { label: "8-12 years", emoji: "🧑", group: "age" },
  ],
};

export const BUNDLE_TAGS: { value: BundleTag; label: string; emoji: string; group: "season" | "age" | "gender" }[] = [
  { value: "winter-play", label: "Winter Play", emoji: "❄️", group: "season" },
  { value: "muddy-weather", label: "Muddy Weather", emoji: "🌧️", group: "season" },
  { value: "summer-fun", label: "Summer Fun", emoji: "☀️", group: "season" },
  { value: "rainy-days", label: "Rainy Days", emoji: "🌂", group: "season" },
  { value: "snow-gear", label: "Snow Gear", emoji: "⛷️", group: "season" },
  { value: "beach-time", label: "Beach Time", emoji: "🏖️", group: "season" },
  { value: "sports", label: "Sports", emoji: "⚽", group: "season" },
  { value: "baby-essentials", label: "Baby Essentials", emoji: "🍼", group: "season" },
  { value: "toddler-mix", label: "Toddler Mix", emoji: "🧒", group: "season" },
  { value: "school-ready", label: "School Ready", emoji: "🎒", group: "season" },
  { value: "boys", label: "Boys", emoji: "👦", group: "gender" },
  { value: "girls", label: "Girls", emoji: "👧", group: "gender" },
  { value: "unisex", label: "Unisex", emoji: "🧒", group: "gender" },
  { value: "0-6m", label: "0-6 months", emoji: "👶", group: "age" },
  { value: "6-12m", label: "6-12 months", emoji: "👶", group: "age" },
  { value: "1-2y", label: "1-2 years", emoji: "🧒", group: "age" },
  { value: "2-4y", label: "2-4 years", emoji: "🧒", group: "age" },
  { value: "4-6y", label: "4-6 years", emoji: "👦", group: "age" },
  { value: "6-8y", label: "6-8 years", emoji: "👧", group: "age" },
  { value: "8-12y", label: "8-12 years", emoji: "🧑", group: "age" },
];

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
