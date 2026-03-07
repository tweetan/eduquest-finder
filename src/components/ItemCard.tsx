import { cn } from "@/lib/utils";
import type { Item } from "@/types";
import { CATEGORIES } from "@/types";
import { PointsBadge } from "./PointsBadge";
import { MapPin, Star, Package, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ItemCardProps {
  item: Item;
  onClick?: () => void;
  className?: string;
}

const placeholderImages: Record<string, string> = {
  clothing: "👕",
  shoes: "👟",
  gear: "🍼",
  toys: "🧸",
  outdoor: "⛷️",
  furniture: "🪑",
  accessories: "🎒",
  other: "📦",
};

const conditionColors: Record<string, string> = {
  "like-new": "bg-kidswap-green/10 text-kidswap-green",
  good: "bg-kidswap-blue/10 text-blue-600",
  fair: "bg-kidswap-yellow/10 text-yellow-700",
};

export function ItemCard({ item, onClick, className }: ItemCardProps) {
  const emoji = placeholderImages[item.category] || "📦";
  const category = CATEGORIES.find((c) => c.value === item.category);

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group",
        item.isStar && "ring-2 ring-kidswap-yellow/50",
        item.status !== "available" && "opacity-60",
        className
      )}
    >
      {/* Image area */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-5xl group-hover:animate-wiggle transition-transform">
            {emoji}
          </span>
        )}

        {/* Point badge */}
        <div className="absolute top-2 right-2">
          <PointsBadge points={item.pointValue} size="md" />
        </div>

        {/* Star badge */}
        {item.isStar && (
          <div className="absolute top-2 left-2 bg-kidswap-yellow text-kidswap-yellow-foreground px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
            <Star size={12} className="fill-current" />
            STAR
          </div>
        )}

        {/* Status overlay */}
        {item.status !== "available" && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-medium capitalize">
              {item.status}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-sm line-clamp-1">{item.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
          {item.description}
        </p>

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {category?.emoji} {category?.label}
          </Badge>
          <Badge
            variant="secondary"
            className={cn("text-[10px] px-1.5 py-0", conditionColors[item.condition])}
          >
            {item.condition === "like-new" ? "Like New" : item.condition}
          </Badge>
          {item.isLocalPickupOnly && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              <MapPin size={8} className="mr-0.5" /> Pickup
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
          <span>{item.sellerName}</span>
          {item.ageRange && <span>{item.ageRange}</span>}
        </div>
      </div>
    </div>
  );
}
