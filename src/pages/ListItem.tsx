import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { CATEGORIES, LISTABLE_ITEMS, TIER_INFO } from "@/types";
import type { ItemCategory, ItemCondition, Item, BundleItem } from "@/types";
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
import { Star, Camera, Check, Info, X, Plus, AlertTriangle, ImagePlus } from "lucide-react";

type ListTier = "bundle" | "plus" | "star";

export default function ListItem() {
  const navigate = useNavigate();
  const addItem = useStore((s) => s.addItem);
  const addItemWithPhotos = useStore((s) => s.addItemWithPhotos);
  const isOnline = useStore((s) => s.isOnline);
  const user = useStore((s) => s.user);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ItemCategory>("clothing");
  const [condition, setCondition] = useState<ItemCondition>("good");
  const [tier, setTier] = useState<ListTier>("bundle");
  const [ageRange, setAgeRange] = useState("");
  const [size, setSize] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [showPointsAnim, setShowPointsAnim] = useState(false);
  const [listed, setListed] = useState(false);
  const [listedPointValue, setListedPointValue] = useState(0);

  // Bundle items
  const [bundleItems, setBundleItems] = useState<BundleItem[]>([]);
  const [selectedBundleItem, setSelectedBundleItem] = useState("");

  // Plus/Star item selection
  const [selectedItem, setSelectedItem] = useState("");

  // Photo upload
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableItemsForTier = useMemo(
    () => LISTABLE_ITEMS.filter((item) => item.tier === tier),
    [tier]
  );

  const totalBundlePoints = useMemo(
    () => bundleItems.reduce((sum, item) => sum + item.points, 0),
    [bundleItems]
  );

  const isStar = tier === "star";
  const isBundle = tier === "bundle";

  const effectivePointValue = useMemo(() => {
    if (isBundle) return totalBundlePoints;
    const found = LISTABLE_ITEMS.find((i) => i.name === selectedItem && i.tier === tier);
    return found?.points || (tier === "plus" ? 5 : 10);
  }, [tier, isBundle, totalBundlePoints, selectedItem]);

  const canSubmit = useMemo(() => {
    if (!title.trim() || !description.trim()) return false;
    if (isBundle) return totalBundlePoints >= 5;
    if (tier === "plus" || tier === "star") return !!selectedItem;
    return false;
  }, [title, description, isBundle, totalBundlePoints, tier, selectedItem]);

  const handleAddBundleItem = () => {
    if (!selectedBundleItem) return;
    const itemDef = LISTABLE_ITEMS.find(
      (i) => i.name === selectedBundleItem && i.tier === "bundle"
    );
    if (!itemDef) return;

    const newItem: BundleItem = {
      id: `bundle-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: itemDef.name,
      points: itemDef.points,
    };
    setBundleItems([...bundleItems, newItem]);
    setSelectedBundleItem("");
  };

  const handleRemoveBundleItem = (id: string) => {
    setBundleItems(bundleItems.filter((i) => i.id !== id));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      setPhotoFiles((prev) => [...prev, file]);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoFiles(photoFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      if (isBundle && totalBundlePoints < 5) {
        toast.error("Not enough points", {
          description: `Your bundle needs at least 5 points. Currently at ${totalBundlePoints}.`,
        });
      } else {
        toast.error("Please fill in all required fields");
      }
      return;
    }

    setIsSubmitting(true);

    const item: Item = {
      id: `item-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      category,
      condition,
      pointValue: effectivePointValue,
      imageUrls: photos, // data URLs as fallback
      sellerId: user.id,
      sellerName: user.firstName || user.name,
      status: "available",
      createdAt: new Date().toISOString(),
      isStar,
      isLocalPickupOnly: isStar,
      ageRange: ageRange || undefined,
      size: size || undefined,
      tier,
      bundleItems: isBundle ? bundleItems : undefined,
    };

    try {
      // If online with real files, upload to Supabase Storage
      if (isOnline && photoFiles.length > 0) {
        await addItemWithPhotos(item, photoFiles);
      } else {
        addItem(item);
      }
    } catch {
      // Fallback: save with data URLs
      addItem(item);
    }

    setIsSubmitting(false);
    setListed(true);
    setListedPointValue(effectivePointValue);
    setShowConfetti(true);
    setShowPointsAnim(true);
    playList();

    toast.success(`Item listed! +${effectivePointValue} point${effectivePointValue > 1 ? "s" : ""}`, {
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
        <PointsAnimation amount={listedPointValue} type="earn" trigger={showPointsAnim} />

        <div className="animate-bounce-in">
          <div className="w-20 h-20 rounded-full bg-kidswap-green/10 flex items-center justify-center mx-auto mb-4">
            <Check size={40} className="text-kidswap-green" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Item Listed!</h1>
          <p className="text-muted-foreground mb-2">
            You earned <strong>{listedPointValue} point{listedPointValue > 1 ? "s" : ""}</strong>
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
              setBundleItems([]);
              setSelectedItem("");
              setPhotos([]);
              setPhotoFiles([]);
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

      {/* Disclaimer */}
      <div className="bg-kidswap-purple/5 border border-kidswap-purple/20 rounded-xl p-3 mb-4">
        <p className="text-xs text-muted-foreground">
          <strong>Remember:</strong> You need to list things for 5 points minimum. You can list several things in a bundle, but star items are listed on their own.
        </p>
      </div>

      <div className="space-y-4">
        {/* Photo upload */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Photos</Label>
          <div className="flex gap-2 flex-wrap">
            {photos.map((photo, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => handleRemovePhoto(i)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center"
                >
                  <X size={12} className="text-white" />
                </button>
              </div>
            ))}
            <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-gray-300 bg-gray-50">
              <ImagePlus size={20} className="text-muted-foreground" />
              <span className="text-[9px] text-muted-foreground mt-0.5">Add</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </label>
          </div>
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

        {/* Item Value Tier */}
        <div>
          <Label className="text-sm font-medium">Item Value Tier</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {(["bundle", "plus", "star"] as ListTier[]).map((t) => {
              const info = TIER_INFO[t];
              const selected = tier === t;
              return (
                <button
                  key={t}
                  onClick={() => {
                    setTier(t);
                    setBundleItems([]);
                    setSelectedItem("");
                  }}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    selected
                      ? t === "star"
                        ? "border-kidswap-pink bg-kidswap-pink/5"
                        : t === "plus"
                        ? "border-kidswap-purple bg-kidswap-purple/5"
                        : "border-kidswap-teal bg-kidswap-teal/5"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <span className="font-bold text-sm">{info.label}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {info.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bundle item selector */}
        {isBundle && (
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Add items to bundle</Label>
              <div className="flex gap-2 mt-1">
                <Select
                  value={selectedBundleItem}
                  onValueChange={setSelectedBundleItem}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Choose an item..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableItemsForTier.map((item) => (
                      <SelectItem key={item.name} value={item.name}>
                        {item.name} ({item.points} pt{item.points > 1 ? "s" : ""})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleAddBundleItem}
                  disabled={!selectedBundleItem}
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>

            {bundleItems.length > 0 && (
              <div className="space-y-1.5">
                {bundleItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{item.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.points} pt{item.points > 1 ? "s" : ""}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveBundleItem(item.id)}
                      className="text-muted-foreground hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <div className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium text-sm ${
                  totalBundlePoints >= 5
                    ? "bg-kidswap-green/10 text-kidswap-green"
                    : "bg-kidswap-orange/10 text-kidswap-orange"
                }`}>
                  <span>Total</span>
                  <span>{totalBundlePoints} / 5 pts minimum</span>
                </div>
              </div>
            )}

            {totalBundlePoints > 0 && totalBundlePoints < 5 && (
              <div className="flex items-start gap-2 text-xs text-kidswap-orange">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>Add more items to reach the 5-point minimum. You need {5 - totalBundlePoints} more point{5 - totalBundlePoints > 1 ? "s" : ""}.</span>
              </div>
            )}
          </div>
        )}

        {/* Plus / Star item selector */}
        {(tier === "plus" || tier === "star") && (
          <div>
            <Label className="text-sm font-medium">Choose item</Label>
            <Select
              value={selectedItem}
              onValueChange={setSelectedItem}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Choose an item..." />
              </SelectTrigger>
              <SelectContent>
                {availableItemsForTier.map((item) => (
                  <SelectItem key={item.name} value={item.name}>
                    {item.name} ({item.points} pts)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Star item notice */}
        {isStar && selectedItem && (
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
          disabled={!canSubmit || isSubmitting}
        >
          {isSubmitting
            ? "Uploading..."
            : isBundle && totalBundlePoints < 5
            ? `Need ${5 - totalBundlePoints} more pts to list`
            : `List ${tier === "bundle" ? "Bundle" : selectedItem || "Item"} — Earn ${effectivePointValue} Point${effectivePointValue > 1 ? "s" : ""}`}
        </Button>
      </div>
    </div>
  );
}
