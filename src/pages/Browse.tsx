import { useState, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { ItemCard } from "@/components/ItemCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES, TIER_INFO } from "@/types";
import type { ItemCategory, PointTier } from "@/types";
import { Search, SlidersHorizontal, Star } from "lucide-react";
import { ItemDetail } from "@/components/ItemDetail";
import type { Item } from "@/types";

export default function Browse() {
  const items = useStore((s) => s.items);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | "all">("all");
  const [selectedTier, setSelectedTier] = useState<PointTier | "all">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const availableItems = useMemo(() => {
    return items.filter((item) => {
      if (item.status !== "available") return false;
      if (item.sellerId === "user-1") return false;
      if (selectedCategory !== "all" && item.category !== selectedCategory) return false;
      if (selectedTier !== "all" && item.pointValue !== selectedTier) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.includes(q)
        );
      }
      return true;
    });
  }, [items, search, selectedCategory, selectedTier]);

  const starItems = availableItems.filter((i) => i.isStar);
  const regularItems = availableItems.filter((i) => !i.isStar);

  if (selectedItem) {
    return <ItemDetail item={selectedItem} onBack={() => setSelectedItem(null)} />;
  }

  return (
    <div className="pb-20 pt-2 px-4 max-w-lg mx-auto">
      {/* Search */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-full bg-gray-50 border-none"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full shrink-0"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal size={16} />
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="space-y-3 mb-4 animate-slide-up">
          {/* Categories */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            <Badge
              variant={selectedCategory === "all" ? "default" : "outline"}
              className="cursor-pointer shrink-0 rounded-full"
              onClick={() => setSelectedCategory("all")}
            >
              All
            </Badge>
            {CATEGORIES.map((cat) => (
              <Badge
                key={cat.value}
                variant={selectedCategory === cat.value ? "default" : "outline"}
                className="cursor-pointer shrink-0 rounded-full"
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === cat.value ? "all" : cat.value
                  )
                }
              >
                {cat.emoji} {cat.label}
              </Badge>
            ))}
          </div>

          {/* Point tiers */}
          <div className="flex gap-2">
            {([1, 5, 10] as PointTier[]).map((tier) => (
              <Button
                key={tier}
                variant={selectedTier === tier ? "default" : "outline"}
                size="sm"
                className={`rounded-full text-xs ${
                  selectedTier === tier ? TIER_INFO[tier].color + " text-white" : ""
                }`}
                onClick={() =>
                  setSelectedTier(selectedTier === tier ? "all" : tier)
                }
              >
                {tier === 10 && <Star size={12} className="mr-1" />}
                {tier} pt{tier > 1 ? "s" : ""}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Star Items Section */}
      {starItems.length > 0 && selectedTier !== 1 && selectedTier !== 5 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Star size={18} className="text-kidswap-yellow fill-kidswap-yellow" />
            <h2 className="font-bold text-sm">Star Items</h2>
            <span className="text-xs text-muted-foreground">Local pickup only</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {starItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onClick={() => setSelectedItem(item)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular Items */}
      <div>
        {(starItems.length > 0 && selectedTier !== 1 && selectedTier !== 5) && (
          <h2 className="font-bold text-sm mb-3">All Items</h2>
        )}
        {regularItems.length === 0 && starItems.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <span className="text-4xl block mb-3">🔍</span>
            <p className="font-medium">No items found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {regularItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onClick={() => setSelectedItem(item)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
