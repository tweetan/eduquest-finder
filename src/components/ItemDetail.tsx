import { useState } from "react";
import { useStore } from "@/store/useStore";
import type { Item } from "@/types";
import { CATEGORIES, TIER_INFO } from "@/types";
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
  Package,
  Flag,
  AlertTriangle,
  Check,
  Truck,
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
  const { user, claimItem, canClaimStarItem, getStarClaimsRemaining, flagItem } =
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

  const handleClaim = () => {
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
        description: item.isStar
          ? "Arrange local pickup with the seller."
          : `A shipping fee of $5.99 will apply.`,
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
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
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

      {/* Info */}
      <div className="px-4 mt-4 space-y-3">
        <div>
          <h1 className="text-xl font-bold">{item.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
        </div>

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

        {/* Star claim info */}
        {item.isStar && (
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

          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
            onClick={() => setShowFlagDialog(true)}
          >
            <Flag size={14} className="mr-1" /> Report quality issue
          </Button>
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
