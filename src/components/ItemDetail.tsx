import { useState } from "react";
import { useStore } from "@/store/useStore";
import type { Item } from "@/types";
import { CATEGORIES } from "@/types";
import { PointsBadge } from "./PointsBadge";
import { Confetti } from "./Confetti";
import { PointsAnimation } from "./PointsAnimation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Star,
  MapPin,
  Flag,
  AlertTriangle,
  Check,
  Truck,
  Phone,
  User,
} from "lucide-react";
import { playClaim, playStarClaim, playError } from "@/lib/sounds";
import { toast } from "sonner";

interface ItemDetailProps {
  item: Item;
  onBack: () => void;
}

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

export function ItemDetail({ item, onBack }: ItemDetailProps) {
  const { user, claimItem, canClaimStarItem, getStarClaimsRemaining, flagItem, claims } =
    useStore();
  const [showConfetti, setShowConfetti] = useState(false);
  const [showPointsAnim, setShowPointsAnim] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [flagReason, setFlagReason] = useState("");

  const category = CATEGORIES.find((c) => c.value === item.category);
  const emoji = placeholderEmojis[item.category] || "📦";
  const canAfford = user.points >= item.pointValue;
  const canClaimStar = item.isStar ? canClaimStarItem() : true;

  // Find the claim record for this item (to show contact details)
  const claimRecord = claims.find(
    (c) => c.itemId === item.id && c.claimerId === user.id
  );

  const handleClaim = () => {
    if (user.isSuspended) {
      playError();
      toast.error("Account suspended", {
        description: "Your account has been suspended. Please contact support.",
      });
      return;
    }

    if (!canAfford) {
      playError();
      toast.error("Not enough points!", {
        description: `You need ${item.pointValue} points but have ${user.points}.`,
      });
      return;
    }

    if (item.isStar && !canClaimStar) {
      playError();
      toast.error("Star claim limit reached", {
        description: "You can only claim 1 star item per 4 months. List a star item to earn a bonus claim!",
      });
      return;
    }

    const success = claimItem(item);
    if (success) {
      setClaimed(true);
      setShowConfetti(true);
      setShowPointsAnim(true);
      if (item.isStar) {
        playStarClaim();
      } else {
        playClaim();
      }
      toast.success("Item claimed!", {
        description: "Contact details are now visible below.",
      });
    }
  };

  const handleFlag = () => {
    if (flagReason.trim()) {
      flagItem(item.id, flagReason);
      setShowFlagDialog(false);
      setFlagReason("");
      toast.warning("Item flagged", {
        description: "Thank you for helping maintain quality standards.",
      });
    }
  };

  // Get the latest claim record (including fresh ones)
  const activeClaimRecord = claimed
    ? useStore.getState().claims.find((c) => c.itemId === item.id && c.claimerId === user.id)
    : claimRecord;

  const imageUrl = item.imageUrls?.[0] || "";

  return (
    <div className="pb-24 max-w-lg mx-auto">
      <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
      <PointsAnimation
        amount={item.pointValue}
        type="spend"
        trigger={showPointsAnim}
      />

      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground px-4 py-2"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Image */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center mx-4 rounded-2xl overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-8xl">{emoji}</span>
        )}

        {item.isStar && (
          <div className="absolute top-3 left-3 bg-kidswap-yellow px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
            <Star size={14} className="fill-current" />
            STAR ITEM
          </div>
        )}

        <div className="absolute top-3 right-3">
          <PointsBadge points={item.pointValue} size="lg" />
        </div>
      </div>

      {/* Multiple photos */}
      {item.imageUrls && item.imageUrls.length > 1 && (
        <div className="flex gap-2 px-4 mt-2 overflow-x-auto">
          {item.imageUrls.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`${item.title} ${i + 1}`}
              className="w-16 h-16 rounded-lg object-cover border-2 border-gray-100 shrink-0"
            />
          ))}
        </div>
      )}

      {/* Info */}
      <div className="px-4 mt-4 space-y-3">
        <div>
          <h1 className="text-xl font-bold">{item.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
        </div>

        {/* Bundle items list */}
        {item.bundleItems && item.bundleItems.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs font-medium mb-2">Items in this bundle:</p>
            <div className="flex flex-wrap gap-1.5">
              {item.bundleItems.map((bi) => (
                <Badge key={bi.id} variant="secondary" className="text-xs">
                  {bi.name} ({bi.points}pt{bi.points > 1 ? "s" : ""})
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            {category?.emoji} {category?.label}
          </Badge>
          <Badge
            variant="secondary"
            className={
              item.condition === "like-new"
                ? "bg-kidswap-green/10 text-kidswap-green"
                : ""
            }
          >
            {item.condition === "like-new" ? "Like New" : item.condition}
          </Badge>
          {item.ageRange && (
            <Badge variant="outline">{item.ageRange}</Badge>
          )}
          {item.size && <Badge variant="outline">Size: {item.size}</Badge>}
          <Badge variant="outline" className="capitalize">{item.tier}</Badge>
        </div>

        {/* Delivery info */}
        <div className="bg-gray-50 rounded-xl p-3 space-y-2">
          {item.isLocalPickupOnly ? (
            <div className="flex items-center gap-2 text-sm">
              <MapPin size={16} className="text-kidswap-orange" />
              <span>
                <strong>Local pickup only</strong> — arrange with seller
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <Truck size={16} className="text-kidswap-blue" />
              <span>
                <strong>Shipping available</strong> — $5.99 shipping fee
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Listed by {item.sellerName}</span>
          </div>
        </div>

        {/* Contact details — shown after claiming */}
        {activeClaimRecord && (
          <div className="bg-kidswap-green/10 border border-kidswap-green/30 rounded-xl p-4 space-y-2">
            <p className="text-sm font-bold text-kidswap-green flex items-center gap-2">
              <Check size={16} /> Claimed! Contact details:
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm">
                <User size={14} className="text-muted-foreground" />
                <span><strong>{activeClaimRecord.sellerFirstName}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone size={14} className="text-muted-foreground" />
                <span>{activeClaimRecord.sellerPhone}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Contact {activeClaimRecord.sellerFirstName} to arrange {item.isLocalPickupOnly ? "pickup" : "shipping"}. You have 1 month to finalize the exchange.
            </p>
          </div>
        )}

        {/* Star claim info */}
        {item.isStar && !claimed && item.status === "available" && (
          <div className="bg-kidswap-yellow/10 border border-kidswap-yellow/30 rounded-xl p-3">
            <div className="flex items-center gap-2 text-sm">
              <Star size={16} className="text-kidswap-yellow fill-kidswap-yellow" />
              <span className="font-medium">
                Star claims remaining: {getStarClaimsRemaining()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              1 star claim per 4 months. List a star item for a bonus claim!
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-2 pt-2">
          {claimed || item.status !== "available" ? (
            <Button disabled className="w-full rounded-full bg-kidswap-green text-white">
              <Check size={16} className="mr-2" />
              {claimed ? "Claimed!" : "Not Available"}
            </Button>
          ) : (
            <Button
              className={`w-full rounded-full text-white ${
                canAfford && canClaimStar
                  ? item.isStar
                    ? "bg-gradient-to-r from-kidswap-pink to-kidswap-orange hover:opacity-90"
                    : "bg-kidswap-purple hover:bg-kidswap-purple/90"
                  : "bg-gray-300"
              }`}
              onClick={handleClaim}
              disabled={!canAfford || !canClaimStar}
            >
              {!canAfford
                ? `Need ${item.pointValue - user.points} more points`
                : !canClaimStar
                ? "Star claim limit reached"
                : `Claim for ${item.pointValue} point${item.pointValue > 1 ? "s" : ""}`}
            </Button>
          )}

          {!claimed && item.status === "available" && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={() => setShowFlagDialog(true)}
            >
              <Flag size={14} className="mr-1" /> Report quality issue
            </Button>
          )}
        </div>
      </div>

      {/* Flag Dialog */}
      <Dialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-kidswap-orange" />
              Report Quality Issue
            </DialogTitle>
            <DialogDescription>
              Flag items that don't meet quality standards. The seller will lose
              points if the flag is confirmed.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Describe the quality issue (stains, tears, worn out, etc.)..."
            value={flagReason}
            onChange={(e) => setFlagReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFlagDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleFlag}
              disabled={!flagReason.trim()}
            >
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
