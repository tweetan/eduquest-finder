import { supabase } from "@/lib/supabase";
import type { Item, UserProfile, ClaimRecord, FlagReport, SupportTicket, BundleItem } from "@/types";

// ============================================================
// Helpers: convert between DB snake_case and app camelCase
// ============================================================

function dbToItem(row: any): Item {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    condition: row.condition,
    pointValue: row.point_value,
    imageUrls: row.image_urls || [],
    sellerId: row.seller_id,
    sellerName: row.seller_name,
    status: row.status,
    createdAt: row.created_at,
    isStar: row.is_star,
    isLocalPickupOnly: row.is_local_pickup_only,
    ageRange: row.age_range || undefined,
    size: row.size || undefined,
    tier: row.tier,
    bundleItems: row.bundle_items || undefined,
  };
}

function itemToDb(item: Item) {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    category: item.category,
    condition: item.condition,
    point_value: item.pointValue,
    image_urls: item.imageUrls,
    seller_id: item.sellerId,
    seller_name: item.sellerName,
    status: item.status,
    is_star: item.isStar,
    is_local_pickup_only: item.isLocalPickupOnly,
    age_range: item.ageRange || null,
    size: item.size || null,
    tier: item.tier,
    bundle_items: item.bundleItems || null,
    created_at: item.createdAt,
  };
}

function dbToProfile(row: any): UserProfile {
  return {
    id: row.id,
    name: row.name,
    firstName: row.first_name,
    avatar: row.avatar,
    email: row.email,
    phone: row.phone,
    address: row.address,
    points: row.points,
    totalEarned: row.total_earned,
    totalSpent: row.total_spent,
    itemsListed: row.items_listed,
    itemsClaimed: row.items_claimed,
    starClaimsUsed: row.star_claims_used,
    starClaimLimit: row.star_claim_limit,
    bonusStarClaims: row.bonus_star_claims,
    lastStarClaimReset: row.last_star_claim_reset,
    hasCompletedOnboarding: row.has_completed_onboarding,
    joinedAt: row.joined_at,
    flagsReceived: row.flags_received,
    warnings: row.warnings,
    isSuspended: row.is_suspended,
    qualityWarnings: row.quality_warnings,
    shippingWarnings: row.shipping_warnings,
  };
}

function profileToDb(profile: Partial<UserProfile>) {
  const map: Record<string, any> = {};
  if (profile.name !== undefined) map.name = profile.name;
  if (profile.firstName !== undefined) map.first_name = profile.firstName;
  if (profile.avatar !== undefined) map.avatar = profile.avatar;
  if (profile.email !== undefined) map.email = profile.email;
  if (profile.phone !== undefined) map.phone = profile.phone;
  if (profile.address !== undefined) map.address = profile.address;
  if (profile.points !== undefined) map.points = profile.points;
  if (profile.totalEarned !== undefined) map.total_earned = profile.totalEarned;
  if (profile.totalSpent !== undefined) map.total_spent = profile.totalSpent;
  if (profile.itemsListed !== undefined) map.items_listed = profile.itemsListed;
  if (profile.itemsClaimed !== undefined) map.items_claimed = profile.itemsClaimed;
  if (profile.starClaimsUsed !== undefined) map.star_claims_used = profile.starClaimsUsed;
  if (profile.starClaimLimit !== undefined) map.star_claim_limit = profile.starClaimLimit;
  if (profile.bonusStarClaims !== undefined) map.bonus_star_claims = profile.bonusStarClaims;
  if (profile.lastStarClaimReset !== undefined) map.last_star_claim_reset = profile.lastStarClaimReset;
  if (profile.hasCompletedOnboarding !== undefined) map.has_completed_onboarding = profile.hasCompletedOnboarding;
  if (profile.flagsReceived !== undefined) map.flags_received = profile.flagsReceived;
  if (profile.warnings !== undefined) map.warnings = profile.warnings;
  if (profile.isSuspended !== undefined) map.is_suspended = profile.isSuspended;
  if (profile.qualityWarnings !== undefined) map.quality_warnings = profile.qualityWarnings;
  if (profile.shippingWarnings !== undefined) map.shipping_warnings = profile.shippingWarnings;
  return map;
}

function dbToClaim(row: any, item?: Item): ClaimRecord {
  return {
    id: row.id,
    itemId: row.item_id,
    item: item || dbToItem(row.items), // joined item data
    claimerId: row.claimer_id,
    claimedAt: row.claimed_at,
    shippingFee: row.shipping_fee ? Number(row.shipping_fee) : undefined,
    status: row.status,
    deadline: row.deadline,
    qualityRating: row.quality_rating || undefined,
    individualRatings: row.individual_ratings || undefined,
    qualityComment: row.quality_comment || undefined,
    claimerDone: row.claimer_done,
    listerDone: row.lister_done,
    shippingReimbursed: row.shipping_reimbursed ?? undefined,
    exchangeRespectful: row.exchange_respectful ?? undefined,
    listerComment: row.lister_comment || undefined,
    sellerFirstName: row.seller_first_name || undefined,
    sellerPhone: row.seller_phone || undefined,
  };
}

// ============================================================
// ITEMS
// ============================================================

export async function fetchItems(): Promise<Item[]> {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(dbToItem);
}

export async function fetchAvailableItems(): Promise<Item[]> {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("status", "available")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(dbToItem);
}

export async function insertItem(item: Item): Promise<Item> {
  const { data, error } = await supabase
    .from("items")
    .insert(itemToDb(item))
    .select()
    .single();
  if (error) throw error;
  return dbToItem(data);
}

export async function updateItem(id: string, updates: Partial<Record<string, any>>): Promise<void> {
  const { error } = await supabase.from("items").update(updates).eq("id", id);
  if (error) throw error;
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) throw error;
}

// ============================================================
// PROFILES
// ============================================================

export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) return null;
  return dbToProfile(data);
}

export async function updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
  const dbUpdates = profileToDb(updates);
  if (Object.keys(dbUpdates).length === 0) return;
  const { error } = await supabase.from("profiles").update(dbUpdates).eq("id", userId);
  if (error) throw error;
}

// ============================================================
// CLAIMS
// ============================================================

export async function fetchClaimsForUser(userId: string): Promise<ClaimRecord[]> {
  // Fetch claims where user is claimer, join item data
  const { data, error } = await supabase
    .from("claims")
    .select("*, items(*)")
    .or(`claimer_id.eq.${userId}`)
    .order("claimed_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((row: any) => dbToClaim(row));
}

export async function insertClaim(claim: ClaimRecord): Promise<ClaimRecord> {
  const { data, error } = await supabase
    .from("claims")
    .insert({
      item_id: claim.itemId,
      claimer_id: claim.claimerId,
      claimed_at: claim.claimedAt,
      shipping_fee: claim.shippingFee || null,
      status: claim.status,
      deadline: claim.deadline,
      claimer_done: claim.claimerDone,
      lister_done: claim.listerDone,
      seller_first_name: claim.sellerFirstName || null,
      seller_phone: claim.sellerPhone || null,
    })
    .select("*, items(*)")
    .single();
  if (error) throw error;
  return dbToClaim(data);
}

export async function updateClaim(id: string, updates: Record<string, any>): Promise<void> {
  const { error } = await supabase.from("claims").update(updates).eq("id", id);
  if (error) throw error;
}

// ============================================================
// FLAGS
// ============================================================

export async function insertFlag(flag: FlagReport): Promise<void> {
  const { error } = await supabase.from("flags").insert({
    item_id: flag.itemId,
    reporter_id: flag.reporterId,
    reason: flag.reason,
  });
  if (error) throw error;
}

// ============================================================
// SUPPORT TICKETS
// ============================================================

export async function insertSupportTicket(ticket: SupportTicket): Promise<void> {
  const { error } = await supabase.from("support_tickets").insert({
    claim_id: ticket.claimId,
    type: ticket.type,
    description: ticket.description,
    status: ticket.status,
  });
  if (error) throw error;
}

// ============================================================
// PHOTO UPLOADS
// ============================================================

export async function uploadItemPhoto(file: File, userId: string): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const filePath = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from("item-photos")
    .upload(filePath, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;

  const { data } = supabase.storage.from("item-photos").getPublicUrl(filePath);
  return data.publicUrl;
}

export async function deleteItemPhoto(url: string): Promise<void> {
  // Extract path from full URL
  const match = url.match(/item-photos\/(.+)$/);
  if (!match) return;
  const { error } = await supabase.storage.from("item-photos").remove([match[1]]);
  if (error) throw error;
}
