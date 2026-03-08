import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { CATEGORIES, TIER_INFO } from "@/types";
import type { ItemCategory, ItemCondition, PointTier, Item } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PointsBadge } from "@/components/PointsBadge";
import { Confetti } from "@/components/Confetti";
import { PointsAnimation } from "@/components/PointsAnimation";
import { playList, playSuccess } from "@/lib/sounds";
import { toast } from "sonner";
import { Star, Camera, Check, Info } from "lucide-react";

export default function ListItem() {
  const navigate = useNavigate();
  const addItem = useStore((s) => s.addItem);
  const user = useStore((s) => s.user);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ItemCategory>("clothing");
  const [condition, setCondition] = useState<ItemCondition>("good");
  const [pointValue, setPointValue] = useState<PointTier>(1);
  const [ageRange, setAgeRange] = useState("");
  const [size, setSize] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [showPointsAnim, setShowPointsAnim] = useState(false);
  const [listed, setListed] = useState(false);

  const isStar = pointValue === 10;

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in title and description");
      return;
    }

    const item: Item = {
      id: `item-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      category,
      condition,
      pointValue,
      imageUrl: "",
      sellerId: user.id,
      sellerName: user.name,
      status: "available",
      createdAt: new Date().toISOString(),
      isStar,
      isLocalPickupOnly: isStar,
      ageRange: ageRange || undefined,
      size: size || undefined,
    };

    addItem(item);
    setListed(true);
    setShowConfetti(true);
    setShowPointsAnim(true);
    playList();

    toast.success(`Item listed! +${pointValue} point${pointValue > 1 ? "s" : ""}`, {
      description: isStar
        ? "You also earned a bonus star claim!"
        : "Your item is now available for others to claim.",
    });

    setTimeout(() => {
      playSuccess();
    }, 500);
  };

  if (listed) {
    return (
      <div className="pb-20 pt-8 px-4 max-w-lg mx-auto text-center">
        <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
        <PointsAnimation amount={pointValue} type="earn" trigger={showPointsAnim} />

        <div className="animate-bounce-in">
          <div className="w-20 h-20 rounded-full bg-kidswap-green/10 flex items-center justify-center mx-auto mb-4">
            <Check size={40} className="text-kidswap-green" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Item Listed!</h1>
          <p className="text-muted-foreground mb-2">
            You earned <strong>{pointValue} point{pointValue > 1 ? "s" : ""}</strong>
          </p>
          {isStar && (
            <p className="text-sm text-kidswap-purple font-medium mb-4">
              + 1 bonus star claim earned!
            </p>
          )}
          <p className="text-sm text-muted-foreground mb-6">
            Your total: <strong>{user.points} points</strong>
          </p>
        </div>

        <div className="space-y-3">
          <Button
            className="w-full rounded-full bg-kidswap-purple hover:bg-kidswap-purple/90"
            onClick={() => {
              setListed(false);
              setTitle("");
              setDescription("");
              setAgeRange("");
              setSize("");
            }}
          >
            List Another Item
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-full"
            onClick={() => navigate("/")}
          >
            Browse Items
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-2 px-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-1">List an Item</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Earn points by sharing items your kids have outgrown.
      </p>

      <div className="space-y-4">
        {/* Photo placeholder */}
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center bg-gray-50">
          <Camera size={32} className="mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Photo upload coming soon
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Items must be clean and in good condition
          </p>
        </div>

        {/* Title */}
        <div>
          <Label htmlFor="title" className="text-sm font-medium">
            Title
          </Label>
          <Input
            id="title"
            placeholder="e.g., Baby Onesies Bundle (5 pieces)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description" className="text-sm font-medium">
            Description
          </Label>
          <Textarea
            id="description"
            placeholder="Describe the item, its condition, brand, etc."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1"
          />
        </div>

        {/* Category */}
        <div>
          <Label className="text-sm font-medium">Category</Label>
          <Select
            value={category}
            onValueChange={(v) => setCategory(v as ItemCategory)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.emoji} {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Condition */}
        <div>
          <Label className="text-sm font-medium">Condition</Label>
          <Select
            value={condition}
            onValueChange={(v) => setCondition(v as ItemCondition)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="like-new">Like New</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Point Value / Tier */}
        <div>
          <Label className="text-sm font-medium">Item Value Tier</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {([1, 5, 10] as PointTier[]).map((tier) => {
              const info = TIER_INFO[tier];
              const selected = pointValue === tier;
              return (
                <button
                  key={tier}
                  onClick={() => setPointValue(tier)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    selected
                      ? tier === 10
                        ? "border-kidswap-pink bg-kidswap-pink/5"
                        : tier === 5
                        ? "border-kidswap-purple bg-kidswap-purple/5"
                        : "border-kidswap-teal bg-kidswap-teal/5"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <PointsBadge points={tier} size="sm" />
                    <span className="font-bold text-sm">{info.label}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {info.examples}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Star item notice */}
        {isStar && (
          <div className="bg-kidswap-yellow/10 border border-kidswap-yellow/30 rounded-xl p-3 flex items-start gap-2">
            <Star
              size={16}
              className="text-kidswap-yellow fill-kidswap-yellow mt-0.5 shrink-0"
            />
            <div>
              <p className="text-sm font-medium">This is a Star Item!</p>
              <p className="text-xs text-muted-foreground">
                You'll earn 10 points + 1 bonus star claim. This item will be
                local pickup only.
              </p>
            </div>
          </div>
        )}

        {/* Optional fields */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="age" className="text-sm font-medium">
              Age Range
            </Label>
            <Input
              id="age"
              placeholder="e.g., 0-3 months"
              value={ageRange}
              onChange={(e) => setAgeRange(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="size" className="text-sm font-medium">
              Size
            </Label>
            <Input
              id="size"
              placeholder="e.g., 3T, Size 5"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        {/* Quality reminder */}
        <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-2">
          <Info size={16} className="text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            Items must be clean, free of stains or tears, and fully functional.
            Items that don't meet standards may be flagged, resulting in point
            loss.
          </p>
        </div>

        {/* Submit */}
        <Button
          className="w-full rounded-full bg-kidswap-purple hover:bg-kidswap-purple/90 text-white"
          size="lg"
          onClick={handleSubmit}
          disabled={!title.trim() || !description.trim()}
        >
          List Item — Earn {pointValue} Point{pointValue > 1 ? "s" : ""}
        </Button>
      </div>
    </div>
  );
}
