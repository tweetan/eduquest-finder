import { useStore } from "@/store/useStore";
import { Badge } from "@/components/ui/badge";
import { PointsBadge } from "@/components/PointsBadge";
import { Package, MapPin, Clock, Check, AlertTriangle, Truck } from "lucide-react";

const statusConfig = {
  pending: { label: "Pending", icon: Clock, color: "bg-kidswap-yellow/10 text-yellow-700" },
  shipped: { label: "Shipped", icon: Truck, color: "bg-kidswap-blue/10 text-blue-600" },
  received: { label: "Received", icon: Check, color: "bg-kidswap-green/10 text-kidswap-green" },
  flagged: { label: "Flagged", icon: AlertTriangle, color: "bg-red-50 text-red-500" },
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

export default function Claims() {
  const claims = useStore((s) => s.claims);

  return (
    <div className="pb-20 pt-2 px-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-1">My Claims</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Items you've claimed from other families.
      </p>

      {claims.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <span className="text-5xl block mb-3">📦</span>
          <p className="font-medium">No claims yet</p>
          <p className="text-sm">Browse items and use your points to claim!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {claims.map((claim) => {
            const config = statusConfig[claim.status];
            const StatusIcon = config.icon;
            const emoji = placeholderEmojis[claim.item.category] || "📦";

            return (
              <div
                key={claim.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
              >
                <div className="flex gap-3">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                    <span className="text-2xl">{emoji}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm line-clamp-1">
                        {claim.item.title}
                      </h3>
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
                          <Package size={8} className="mr-0.5" /> ${claim.shippingFee}
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-muted-foreground mt-2">
                  Claimed {new Date(claim.claimedAt).toLocaleDateString()}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
