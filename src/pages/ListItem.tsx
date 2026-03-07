import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { CATEGORIES, TIER_INFO, BUNDLE_TAGS } from "@/types";
import type { ItemCategory, ItemCondition, PointTier, Item, BundleType, BundleTag } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Star, Camera, Check, Info, Package, Shuffle, Minus, Plus } from "lucide-react";

export default function ListItem() {
  const navigate = useNavigate();
  const addItem = useStore((s) => s.addItem);
  const user = useStore((s) => s.user);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ItemCategory>("clothing");
  const [condition, setCondition] = useState<ItemCondition>("good");
  const [bundleType, setBundleType] = useState<BundleType>("basic");
  const [ageRange, setAgeRange] = useState("");
  const [size, setSize] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [showPointsAnim, setShowPointsAnim] = useState(false);
  const [listed, setListed] = useState(false);
  const [selectedTags, setSelectedTags] = useState<BundleTag[]>([]);

  // Bundle item counts
  const [basicCount, setBasicCount] = useState(5);
  const [plusCount, setPlusCount] = useState(0);
  const [starCount, setStarCount] = useState(0);

  // Mix bundle counts
  const [mixBasicCount, setMixBasicCount] = useState(5);
  const [mixPlusCount, setMixPlusCount] = useState(1);

  const isStar = bundleType === "star";

  const getTotalPoints = () => {
    switch (bundleType) {
      case "basic":
        return basicCount * 1;
      case "plus":
        return plusCount * 5;
      case "star":
        return starCount * 10;
      case "mix":
        return mixBasicCount * 1 + mixPlusCount * 5;
    }
  };

  const getTotalItemCount = () => {
    switch (bundleType) {
      case "basic":
        return basicCount;
      case "plus":
        return plusCount;
      case "star":
        return starCount;
      case "mix":
        return mixBasicCount + mixPlusCount;
    }
  };

  const getPointBreakdown = (): { tier: PointTier; count: number }[] => {
    switch (bundleType) {
      case "basic":
        return [{ tier: 1, count: basicCount }];
      case "plus":
        return [{ tier: 5, count: plusCount }];
      case "star":
        return [{ tier: 10, count: starCount }];
      case "mix":
        const breakdown: { tier: PointTier; count: number }[] = [];
        if (mixPlusCount > 0) breakdown.push({ tier: 5, count: mixPlusCount });
        if (mixBasicCount > 0) breakdown.push({ tier: 1, count: mixBasicCount });
        return breakdown;
    }
  };

  const isValidBundle = () => {
    switch (bundleType) {
      case "basic":
        return basicCount >= 5;
      case "plus":
        return plusCount >= 1;
      case "star":
        return starCount >= 1;
      case "mix":
        return (mixBasicCount + mixPlusCount) >= 2 && mixPlusCount >= 1;
    }
  };

  const toggleTag = (tag: BundleTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const totalPoints = getTotalPoints();

  // Calculate bonus star info
  const getBonusStarInfo = () => {
    if (isStar) return "You'll earn 1 bonus star claim for listing this star item!";
    const plusInBundle = bundleType === "plus" ? plusCount : bundleType === "mix" ? mixPlusCount : 0;
    const currentPlus = user.plusItemsListedSinceLastBonus;
    const totalPlus = currentPlus + plusInBundle;
    const bonusStars = Math.floor(totalPlus / 2);
    if (bonusStars > 0) {
      return `This listing earns you ${bonusStars} bonus star claim${bonusStars > 1 ? "s" : ""} (from listing ${plusInBundle} Plus item${plusInBundle > 1 ? "s" : ""})!`;
    }
    if (plusInBundle > 0 && totalPlus % 2 === 1) {
      return `${totalPlus} of 2 Plus items listed toward your next bonus star claim.`;
    }
    return null;
  };

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in title and description");
      return;
    }

    if (!isValidBundle()) {
      if (bundleType === "basic") {
        toast.error("Basic bundles need at least 5 items");
      } else {
        toast.error("Please add items to your bundle");
      }
      return;
    }

    const primaryTier: PointTier = bundleType === "star" ? 10 : bundleType === "plus" ? 5 : bundleType === "mix" ? 5 : 1;

    const item: Item = {
      id: `item-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      category,
      condition,
      pointValue: primaryTier,
      imageUrl: "",
      sellerId: user.id,
      sellerName: user.name,
      status: "available",
      createdAt: new Date().toISOString(),
      isStar,
      isLocalPickupOnly: isStar,
      ageRange: ageRange || undefined,
      size: size || undefined,
      bundleType,
      bundleItemCount: getTotalItemCount(),
      bundleTags: selectedTags.length > 0 ? selectedTags : undefined,
      bundlePointBreakdown: getPointBreakdown(),
    };

    addItem(item);
    setListed(true);
    setShowConfetti(true);
    setShowPointsAnim(true);
    playList();

    toast.success(`Bundle listed! +${totalPoints} point${totalPoints > 1 ? "s" : ""}`, {
      description: isStar
        ? "You also earned a bonus star claim!"
        : "Your bundle is now available for others to claim.",
    });

    setTimeout(() => {
      playSuccess();
    }, 500);
  };

  if (listed) {
    const bonusInfo = getBonusStarInfo();
    return (
      <div className="pb-20 pt-8 px-4 max-w-lg mx-auto text-center">
        <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
        <PointsAnimation amount={totalPoints} type="earn" trigger={showPointsAnim} />

        <div className="animate-bounce-in">
          <div className="w-20 h-20 rounded-full bg-kidswap-green/10 flex items-center justify-center mx-auto mb-4">
            <Check size={40} className="text-kidswap-green" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Bundle Listed!</h1>
          <p className="text-muted-foreground mb-2">
            You earned <strong>{totalPoints} point{totalPoints > 1 ? "s" : ""}</strong> for {getTotalItemCount()} items
          </p>
          {bonusInfo && (
            <p className="text-sm text-kidswap-purple font-medium mb-4">
              {bonusInfo}
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
              setSelectedTags([]);
              setBasicCount(5);
              setPlusCount(0);
              setStarCount(0);
              setMixBasicCount(5);
              setMixPlusCount(1);
            }}
          >
            List Another Bundle
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
      <h1 className="text-xl font-bold mb-1">List a Bundle</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Earn points by sharing items your kids have outgrown. Items are always listed as bundles.
      </p>

      <div className="space-y-4">
        {/* Bundle Type Selection */}
        <div>
          <Label className="text-sm font-medium">Bundle Type</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              onClick={() => setBundleType("basic")}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                bundleType === "basic"
                  ? "border-kidswap-teal bg-kidswap-teal/5"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Package size={16} className="text-kidswap-teal" />
                <span className="font-bold text-sm">Basic Bundle</span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                1 pt/item, min 5 items = 5+ pts
              </p>
            </button>

            <button
              onClick={() => setBundleType("plus")}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                bundleType === "plus"
                  ? "border-kidswap-purple bg-kidswap-purple/5"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Package size={16} className="text-kidswap-purple" />
                <span className="font-bold text-sm">Plus Bundle</span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                5 pts/item, quality pieces
              </p>
            </button>

            <button
              onClick={() => setBundleType("star")}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                bundleType === "star"
                  ? "border-kidswap-pink bg-kidswap-pink/5"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Star size={16} className="text-kidswap-pink fill-kidswap-pink" />
                <span className="font-bold text-sm">Star Item</span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                10 pts, big items, local pickup
              </p>
            </button>

            <button
              onClick={() => setBundleType("mix")}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                bundleType === "mix"
                  ? "border-kidswap-orange bg-kidswap-orange/5"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Shuffle size={16} className="text-kidswap-orange" />
                <span className="font-bold text-sm">Mix Bundle</span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Combine 1pt + 5pt items together
              </p>
            </button>
          </div>
        </div>

        {/* Item Count Controls */}
        <div>
          <Label className="text-sm font-medium">Items in Bundle</Label>
          {bundleType === "basic" && (
            <div className="mt-2 bg-kidswap-teal/5 border border-kidswap-teal/20 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Basic items (1 pt each)</p>
                  <p className="text-[10px] text-muted-foreground">Minimum 5 items per bundle</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setBasicCount(Math.max(5, basicCount - 1))}
                    className="w-8 h-8 rounded-full bg-white border flex items-center justify-center"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-bold text-lg w-8 text-center">{basicCount}</span>
                  <button
                    onClick={() => setBasicCount(basicCount + 1)}
                    className="w-8 h-8 rounded-full bg-white border flex items-center justify-center"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-kidswap-teal font-medium mt-2">
                = {basicCount} points total
              </p>
            </div>
          )}

          {bundleType === "plus" && (
            <div className="mt-2 bg-kidswap-purple/5 border border-kidswap-purple/20 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Plus items (5 pts each)</p>
                  <p className="text-[10px] text-muted-foreground">Quality or specialized items</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPlusCount(Math.max(1, plusCount - 1))}
                    className="w-8 h-8 rounded-full bg-white border flex items-center justify-center"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-bold text-lg w-8 text-center">{plusCount || 1}</span>
                  <button
                    onClick={() => setPlusCount((plusCount || 1) + 1)}
                    className="w-8 h-8 rounded-full bg-white border flex items-center justify-center"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-kidswap-purple font-medium mt-2">
                = {(plusCount || 1) * 5} points total
              </p>
            </div>
          )}

          {bundleType === "star" && (
            <div className="mt-2 bg-kidswap-pink/5 border border-kidswap-pink/20 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Star item (10 pts)</p>
                  <p className="text-[10px] text-muted-foreground">Large, high-value item</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg w-8 text-center">1</span>
                </div>
              </div>
              <p className="text-xs text-kidswap-pink font-medium mt-2">
                = 10 points + 1 bonus star claim
              </p>
            </div>
          )}

          {bundleType === "mix" && (
            <div className="mt-2 space-y-2">
              <div className="bg-kidswap-purple/5 border border-kidswap-purple/20 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Plus items (5 pts each)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setMixPlusCount(Math.max(1, mixPlusCount - 1))}
                      className="w-8 h-8 rounded-full bg-white border flex items-center justify-center"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="font-bold text-lg w-8 text-center">{mixPlusCount}</span>
                    <button
                      onClick={() => setMixPlusCount(mixPlusCount + 1)}
                      className="w-8 h-8 rounded-full bg-white border flex items-center justify-center"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-kidswap-teal/5 border border-kidswap-teal/20 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Basic items (1 pt each)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setMixBasicCount(Math.max(0, mixBasicCount - 1))}
                      className="w-8 h-8 rounded-full bg-white border flex items-center justify-center"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="font-bold text-lg w-8 text-center">{mixBasicCount}</span>
                    <button
                      onClick={() => setMixBasicCount(mixBasicCount + 1)}
                      className="w-8 h-8 rounded-full bg-white border flex items-center justify-center"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-kidswap-orange/10 rounded-lg p-2 text-center">
                <p className="text-sm font-bold text-kidswap-orange">
                  {getTotalItemCount()} items = {totalPoints} points total
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {mixPlusCount} x 5pts + {mixBasicCount} x 1pt
                </p>
              </div>
            </div>
          )}
        </div>

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
            Bundle Title
          </Label>
          <Input
            id="title"
            placeholder={
              bundleType === "basic"
                ? "e.g., Baby Onesies Bundle (5 pieces)"
                : bundleType === "mix"
                ? "e.g., Winter Play Mix Bundle"
                : bundleType === "star"
                ? "e.g., UPPAbaby Vista Stroller"
                : "e.g., Winter Snow Boots"
            }
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
            placeholder="Describe the items, their condition, brands, etc."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1"
          />
        </div>

        {/* Category */}
        <div>
          <Label className="text-sm font-medium">Item Category</Label>
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

        {/* Bundle Tags */}
        <div>
          <Label className="text-sm font-medium">Bundle Tags (optional)</Label>
          <p className="text-[10px] text-muted-foreground mb-2">
            Tag your bundle by activity/season, gender, or age to help buyers find it
          </p>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Activity / Season</p>
            <div className="flex gap-1.5 flex-wrap">
              {BUNDLE_TAGS.filter((t) => t.group === "season").map((tag) => (
                <Badge
                  key={tag.value}
                  variant={selectedTags.includes(tag.value) ? "default" : "outline"}
                  className={`cursor-pointer text-xs ${
                    selectedTags.includes(tag.value)
                      ? "bg-kidswap-purple text-white"
                      : ""
                  }`}
                  onClick={() => toggleTag(tag.value)}
                >
                  {tag.emoji} {tag.label}
                </Badge>
              ))}
            </div>

            <p className="text-xs font-medium text-muted-foreground mt-2">Gender</p>
            <div className="flex gap-1.5 flex-wrap">
              {BUNDLE_TAGS.filter((t) => t.group === "gender").map((tag) => (
                <Badge
                  key={tag.value}
                  variant={selectedTags.includes(tag.value) ? "default" : "outline"}
                  className={`cursor-pointer text-xs ${
                    selectedTags.includes(tag.value)
                      ? "bg-kidswap-purple text-white"
                      : ""
                  }`}
                  onClick={() => toggleTag(tag.value)}
                >
                  {tag.emoji} {tag.label}
                </Badge>
              ))}
            </div>

            <p className="text-xs font-medium text-muted-foreground mt-2">Age</p>
            <div className="flex gap-1.5 flex-wrap">
              {BUNDLE_TAGS.filter((t) => t.group === "age").map((tag) => (
                <Badge
                  key={tag.value}
                  variant={selectedTags.includes(tag.value) ? "default" : "outline"}
                  className={`cursor-pointer text-xs ${
                    selectedTags.includes(tag.value)
                      ? "bg-kidswap-purple text-white"
                      : ""
                  }`}
                  onClick={() => toggleTag(tag.value)}
                >
                  {tag.emoji} {tag.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>

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

        {/* Bonus star info for plus items */}
        {!isStar && getBonusStarInfo() && (
          <div className="bg-kidswap-purple/10 border border-kidswap-purple/30 rounded-xl p-3 flex items-start gap-2">
            <Star
              size={16}
              className="text-kidswap-purple mt-0.5 shrink-0"
            />
            <p className="text-xs text-muted-foreground">
              {getBonusStarInfo()}
            </p>
          </div>
        )}

        {/* Quality reminder */}
        <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-2">
          <Info size={16} className="text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            All items in a bundle must be clean, free of stains or tears, and fully functional.
            Items that don't meet standards may be flagged, resulting in point
            loss.
          </p>
        </div>

        {/* Submit */}
        <Button
          className="w-full rounded-full bg-kidswap-purple hover:bg-kidswap-purple/90 text-white"
          size="lg"
          onClick={handleSubmit}
          disabled={!title.trim() || !description.trim() || !isValidBundle()}
        >
          List Bundle — Earn {totalPoints} Point{totalPoints > 1 ? "s" : ""}
        </Button>
      </div>
    </div>
  );
}
