import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PointsBadge } from "@/components/PointsBadge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  MapPin,
  Clock,
  Check,
  AlertTriangle,
  Truck,
  Phone,
  User,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import type { ClaimRecord } from "@/types";

const statusConfig = {
  pending: { label: "Pending", icon: Clock, color: "bg-kidswap-yellow/10 text-yellow-700" },
  shipped: { label: "Shipped", icon: Truck, color: "bg-kidswap-blue/10 text-blue-600" },
  received: { label: "Received", icon: Check, color: "bg-kidswap-green/10 text-kidswap-green" },
  flagged: { label: "Flagged", icon: AlertTriangle, color: "bg-red-50 text-red-500" },
  completed: { label: "Completed", icon: Check, color: "bg-kidswap-green/10 text-kidswap-green" },
};

const placeholderEmojis: Record<string, string> = {
  clothing: "👕",
  shoes: "👟",
  gear: "🍼",
  toys: "🧸",
  outdoor: "⛷️",
  furniture: "🪑",
  accessories: "🎒",
  other: "📦",
};

function RatingStars({ rating, onRate }: { rating: number; onRate: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onRate(n)}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            n <= rating
              ? "bg-kidswap-yellow text-white"
              : "bg-gray-100 text-gray-400 hover:bg-gray-200"
          }`}
        >
          <Star size={16} className={n <= rating ? "fill-white" : ""} />
        </button>
      ))}
    </div>
  );
}

export default function Claims() {
  const { claims, items, user, completeClaimAsClaimant, completeClaimAsLister } = useStore();

  // Claimer "Done" dialog state
  const [showClaimerDoneDialog, setShowClaimerDoneDialog] = useState(false);
  const [activeClaim, setActiveClaim] = useState<ClaimRecord | null>(null);
  const [ratingMode, setRatingMode] = useState<"overall" | "individual">("overall");
  const [overallRating, setOverallRating] = useState(0);
  const [individualRatings, setIndividualRatings] = useState<{ itemName: string; rating: number }[]>([]);
  const [qualityComment, setQualityComment] = useState("");

  // Lister "Done" dialog state
  const [showListerDoneDialog, setShowListerDoneDialog] = useState(false);
  const [listerClaim, setListerClaim] = useState<ClaimRecord | null>(null);
  const [shippingReimbursed, setShippingReimbursed] = useState<boolean | null>(null);
  const [exchangeRespectful, setExchangeRespectful] = useState<boolean | null>(null);
  const [listerComment, setListerComment] = useState("");

  // Find claims I made (as claimer) and claims on my listed items (as lister)
  const myClaims = claims.filter((c) => c.claimerId === user.id);
  const myListedItemIds = items.filter((i) => i.sellerId === user.id).map((i) => i.id);
  const claimsOnMyItems = claims.filter((c) => myListedItemIds.includes(c.itemId));

  const handleOpenClaimerDone = (claim: ClaimRecord) => {
    setActiveClaim(claim);
    setOverallRating(0);
    setIndividualRatings(
      claim.item.bundleItems?.map((bi) => ({ itemName: bi.name, rating: 0 })) || []
    );
    setQualityComment("");
    setRatingMode("overall");
    setShowClaimerDoneDialog(true);
  };

  const handleSubmitClaimerDone = () => {
    if (!activeClaim) return;

    if (ratingMode === "overall" && overallRating === 0) {
      toast.error("Please rate the quality");
      return;
    }
    if (ratingMode === "individual" && individualRatings.some((r) => r.rating === 0)) {
      toast.error("Please rate each item");
      return;
    }

    const effectiveRating = ratingMode === "overall"
      ? overallRating
      : Math.round(individualRatings.reduce((sum, r) => sum + r.rating, 0) / individualRatings.length);

    const needsComment = effectiveRating < 3;

    if (needsComment && !qualityComment.trim()) {
      toast.error("Please explain what was wrong with the items");
      return;
    }

    completeClaimAsClaimant(
      activeClaim.id,
      ratingMode === "overall" ? overallRating : effectiveRating,
      ratingMode === "individual" ? individualRatings : undefined,
      qualityComment || undefined
    );

    setShowClaimerDoneDialog(false);
    toast.success("Exchange marked as done!", {
      description: effectiveRating < 3
        ? "Your feedback has been sent to our team for review."
        : "Thank you for your feedback!",
    });
  };

  const handleOpenListerDone = (claim: ClaimRecord) => {
    setListerClaim(claim);
    setShippingReimbursed(null);
    setExchangeRespectful(null);
    setListerComment("");
    setShowListerDoneDialog(true);
  };

  const handleSubmitListerDone = () => {
    if (!listerClaim) return;

    if (shippingReimbursed === null) {
      toast.error("Please indicate if shipping was reimbursed");
      return;
    }
    if (exchangeRespectful === null) {
      toast.error("Please indicate if the exchange was respectful");
      return;
    }

    const needsComment = !exchangeRespectful;
    if (needsComment && !listerComment.trim()) {
      toast.error("Please describe what happened");
      return;
    }

    completeClaimAsLister(
      listerClaim.id,
      shippingReimbursed,
      exchangeRespectful,
      listerComment || undefined
    );

    setShowListerDoneDialog(false);

    if (!shippingReimbursed) {
      toast.success("Done! You received 3 bonus points for unreimbursed shipping.", {
        description: "The claimer has been warned.",
      });
    } else {
      toast.success("Exchange marked as done! Thank you.");
    }
  };

  const isExpired = (deadline: string) => new Date(deadline) < new Date();

  return (
    <div className="pb-20 pt-2 px-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-1">My Claims</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Items you've claimed and items others claimed from you.
      </p>

      {/* --- Claims I made --- */}
      <h2 className="font-bold text-sm mb-3">Items I Claimed</h2>
      {myClaims.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground mb-6">
          <span className="text-4xl block mb-2">📦</span>
          <p className="font-medium">No claims yet</p>
          <p className="text-sm">Browse items and use your points to claim!</p>
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          {myClaims.map((claim) => {
            const config = statusConfig[claim.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            const emoji = placeholderEmojis[claim.item.category] || "📦";
            const expired = isExpired(claim.deadline);

            return (
              <div
                key={claim.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
              >
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                    <span className="text-2xl">{emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm line-clamp-1">{claim.item.title}</h3>
                      <PointsBadge points={claim.item.pointValue} size="sm" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      From {claim.item.sellerName}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={`text-[10px] ${config.color}`}>
                        <StatusIcon size={10} className="mr-1" />
                        {config.label}
                      </Badge>
                      {claim.item.isLocalPickupOnly ? (
                        <Badge variant="outline" className="text-[10px]">
                          <MapPin size={8} className="mr-0.5" /> Pickup
                        </Badge>
                      ) : claim.shippingFee ? (
                        <Badge variant="outline" className="text-[10px]">
                          <Truck size={8} className="mr-0.5" /> ${claim.shippingFee}
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Contact details */}
                {claim.sellerFirstName && (
                  <div className="bg-kidswap-green/5 rounded-lg p-2 mt-3 flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <User size={12} className="text-muted-foreground" />
                      <span className="font-medium">{claim.sellerFirstName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone size={12} className="text-muted-foreground" />
                      <span>{claim.sellerPhone}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-2">
                  <p className="text-[10px] text-muted-foreground">
                    Claimed {new Date(claim.claimedAt).toLocaleDateString()}
                    {!claim.claimerDone && (
                      <span className={expired ? " text-red-500 font-medium" : ""}>
                        {" · "}Deadline: {new Date(claim.deadline).toLocaleDateString()}
                        {expired && " (expired)"}
                      </span>
                    )}
                  </p>

                  {/* Done button for claimer */}
                  {!claim.claimerDone && claim.status !== "completed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 rounded-full"
                      onClick={() => handleOpenClaimerDone(claim)}
                    >
                      <Check size={12} className="mr-1" /> Done
                    </Button>
                  )}
                  {claim.claimerDone && (
                    <Badge className="bg-kidswap-green/10 text-kidswap-green text-[10px]">
                      <Check size={10} className="mr-0.5" /> Rated
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- Claims on my items --- */}
      {claimsOnMyItems.length > 0 && (
        <>
          <h2 className="font-bold text-sm mb-3">Items Others Claimed From Me</h2>
          <div className="space-y-3">
            {claimsOnMyItems.map((claim) => {
              const config = statusConfig[claim.status] || statusConfig.pending;
              const StatusIcon = config.icon;
              const emoji = placeholderEmojis[claim.item.category] || "📦";
              const expired = isExpired(claim.deadline);

              return (
                <div
                  key={claim.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
                >
                  <div className="flex gap-3">
                    <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                      <span className="text-xl">{emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm line-clamp-1">{claim.item.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-[10px] ${config.color}`}>
                          <StatusIcon size={10} className="mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[10px] text-muted-foreground">
                      Claimed {new Date(claim.claimedAt).toLocaleDateString()}
                      {!claim.listerDone && (
                        <span className={expired ? " text-red-500 font-medium" : ""}>
                          {" · "}Deadline: {new Date(claim.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                    {!claim.listerDone && claim.status !== "completed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 rounded-full"
                        onClick={() => handleOpenListerDone(claim)}
                      >
                        <Check size={12} className="mr-1" /> Done
                      </Button>
                    )}
                    {claim.listerDone && (
                      <Badge className="bg-kidswap-green/10 text-kidswap-green text-[10px]">
                        <Check size={10} className="mr-0.5" /> Done
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* === Claimer "Done" Dialog === */}
      <Dialog open={showClaimerDoneDialog} onOpenChange={setShowClaimerDoneDialog}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rate Your Exchange</DialogTitle>
            <DialogDescription>
              How was the quality of the items you received?
            </DialogDescription>
          </DialogHeader>

          {activeClaim && (
            <div className="space-y-4">
              {/* Rating mode choice for bundles */}
              {activeClaim.item.bundleItems && activeClaim.item.bundleItems.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Rate as:</Label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={ratingMode === "overall" ? "default" : "outline"}
                      className="rounded-full text-xs"
                      onClick={() => setRatingMode("overall")}
                    >
                      Whole bundle
                    </Button>
                    <Button
                      size="sm"
                      variant={ratingMode === "individual" ? "default" : "outline"}
                      className="rounded-full text-xs"
                      onClick={() => setRatingMode("individual")}
                    >
                      Each item
                    </Button>
                  </div>
                </div>
              )}

              {/* Overall rating */}
              {ratingMode === "overall" && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Quality Rating
                  </Label>
                  <RatingStars rating={overallRating} onRate={setOverallRating} />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    1 = Very poor, 5 = Excellent
                  </p>
                </div>
              )}

              {/* Individual ratings */}
              {ratingMode === "individual" && individualRatings.length > 0 && (
                <div className="space-y-3">
                  {individualRatings.map((ir, index) => (
                    <div key={index}>
                      <Label className="text-sm mb-1 block">{ir.itemName}</Label>
                      <RatingStars
                        rating={ir.rating}
                        onRate={(n) => {
                          const updated = [...individualRatings];
                          updated[index] = { ...updated[index], rating: n };
                          setIndividualRatings(updated);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Comment for low ratings */}
              {((ratingMode === "overall" && overallRating > 0 && overallRating < 3) ||
                (ratingMode === "individual" && individualRatings.some((r) => r.rating > 0 && r.rating < 3))) && (
                <div>
                  <Label className="text-sm font-medium mb-1 block">
                    What was wrong? *
                  </Label>
                  <Textarea
                    placeholder="Please describe the quality issues..."
                    value={qualityComment}
                    onChange={(e) => setQualityComment(e.target.value)}
                    rows={3}
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Your feedback will be sent to our support team for review.
                  </p>
                </div>
              )}

              {/* Optional comment for ok ratings */}
              {((ratingMode === "overall" && overallRating >= 3) ||
                (ratingMode === "individual" && !individualRatings.some((r) => r.rating > 0 && r.rating < 3) && individualRatings.some((r) => r.rating > 0))) && (
                <div>
                  <Label className="text-sm font-medium mb-1 block">
                    Any comments? (optional)
                  </Label>
                  <Textarea
                    placeholder="Optional feedback..."
                    value={qualityComment}
                    onChange={(e) => setQualityComment(e.target.value)}
                    rows={2}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClaimerDoneDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-kidswap-purple hover:bg-kidswap-purple/90"
              onClick={handleSubmitClaimerDone}
            >
              Submit Rating
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* === Lister "Done" Dialog === */}
      <Dialog open={showListerDoneDialog} onOpenChange={setShowListerDoneDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalize Exchange</DialogTitle>
            <DialogDescription>
              A few questions about how the exchange went.
            </DialogDescription>
          </DialogHeader>

          {listerClaim && (
            <div className="space-y-4">
              {/* Shipping reimbursement */}
              {!listerClaim.item.isLocalPickupOnly && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Were you reimbursed for shipping?
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={shippingReimbursed === true ? "default" : "outline"}
                      className="rounded-full"
                      onClick={() => setShippingReimbursed(true)}
                    >
                      Yes
                    </Button>
                    <Button
                      size="sm"
                      variant={shippingReimbursed === false ? "default" : "outline"}
                      className="rounded-full"
                      onClick={() => setShippingReimbursed(false)}
                    >
                      No
                    </Button>
                  </div>
                  {shippingReimbursed === false && (
                    <p className="text-[10px] text-kidswap-purple mt-1">
                      You'll receive 3 bonus points and the claimer will be warned.
                    </p>
                  )}
                </div>
              )}

              {/* For local pickup, shipping is N/A */}
              {listerClaim.item.isLocalPickupOnly && (
                <div className="bg-gray-50 rounded-lg p-2 text-xs text-muted-foreground">
                  Local pickup — shipping reimbursement not applicable.
                </div>
              )}

              {/* Respectful exchange */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Was the exchange done in a respectful manner?
                </Label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={exchangeRespectful === true ? "default" : "outline"}
                    className="rounded-full"
                    onClick={() => setExchangeRespectful(true)}
                  >
                    Yes
                  </Button>
                  <Button
                    size="sm"
                    variant={exchangeRespectful === false ? "default" : "outline"}
                    className="rounded-full"
                    onClick={() => setExchangeRespectful(false)}
                  >
                    No
                  </Button>
                </div>
              </div>

              {/* Comment when exchange was not respectful */}
              {exchangeRespectful === false && (
                <div>
                  <Label className="text-sm font-medium mb-1 block">
                    What happened? *
                  </Label>
                  <Textarea
                    placeholder="Please describe what happened..."
                    value={listerComment}
                    onChange={(e) => setListerComment(e.target.value)}
                    rows={3}
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Your feedback will be sent to our support team for review.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowListerDoneDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-kidswap-purple hover:bg-kidswap-purple/90"
              onClick={() => {
                // Auto-set shipping to true for local pickup
                if (listerClaim?.item.isLocalPickupOnly && shippingReimbursed === null) {
                  setShippingReimbursed(true);
                }
                handleSubmitListerDone();
              }}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
