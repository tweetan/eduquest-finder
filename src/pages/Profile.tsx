import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Star,
  Package,
  ShoppingBag,
  TrendingUp,
  Award,
  Flag,
  RotateCcw,
  Info,
} from "lucide-react";

export default function Profile() {
  const { user, items, claims, getStarClaimsRemaining } = useStore();

  const myListings = items.filter((i) => i.sellerId === user.id);
  const starClaimsRemaining = getStarClaimsRemaining();
  const totalStarAllowed = user.starClaimLimit + user.bonusStarClaims;

  const stats = [
    {
      label: "Points",
      value: user.points,
      icon: <span className="text-lg">⚡</span>,
      color: "bg-kidswap-yellow/10",
    },
    {
      label: "Listed",
      value: user.itemsListed,
      icon: <Package size={18} className="text-kidswap-purple" />,
      color: "bg-kidswap-purple/10",
    },
    {
      label: "Claimed",
      value: user.itemsClaimed,
      icon: <ShoppingBag size={18} className="text-kidswap-teal" />,
      color: "bg-kidswap-teal/10",
    },
    {
      label: "Earned",
      value: user.totalEarned,
      icon: <TrendingUp size={18} className="text-kidswap-green" />,
      color: "bg-kidswap-green/10",
    },
  ];

  return (
    <div className="pb-20 pt-2 px-4 max-w-lg mx-auto">
      {/* User header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-kidswap-purple to-kidswap-teal flex items-center justify-center text-white text-2xl font-bold">
          {user.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-xl font-bold">{user.name}</h1>
          <p className="text-sm text-muted-foreground">
            Member since {new Date(user.joinedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`${stat.color} rounded-2xl p-4 text-center`}
          >
            <div className="flex justify-center mb-1">{stat.icon}</div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Star Claims */}
      <div className="bg-kidswap-yellow/10 border border-kidswap-yellow/20 rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Star size={18} className="text-kidswap-yellow fill-kidswap-yellow" />
          <h2 className="font-bold text-sm">Star Item Claims</h2>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <Progress
            value={((totalStarAllowed - starClaimsRemaining) / Math.max(totalStarAllowed, 1)) * 100}
            className="flex-1 h-3"
          />
          <span className="text-sm font-medium">
            {starClaimsRemaining}/{totalStarAllowed}
          </span>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            <strong>{starClaimsRemaining}</strong> star claim{starClaimsRemaining !== 1 ? "s" : ""}{" "}
            remaining this period
          </p>
          {user.bonusStarClaims > 0 && (
            <p className="text-kidswap-purple">
              +{user.bonusStarClaims} bonus claim{user.bonusStarClaims > 1 ? "s" : ""} from listing star items
            </p>
          )}
          <p className="flex items-center gap-1">
            <RotateCcw size={10} /> Resets every 4 months
          </p>
        </div>
      </div>

      {/* My Listings */}
      <div className="mb-6">
        <h2 className="font-bold text-sm mb-3 flex items-center gap-2">
          <Package size={16} /> My Listings
        </h2>
        {myListings.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No listings yet. Start earning points by listing items!
          </p>
        ) : (
          <div className="space-y-2">
            {myListings.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 bg-gray-50 rounded-xl p-3"
              >
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-lg">
                  {item.isStar ? "⭐" : item.category === "clothing" ? "👕" : "📦"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {item.status} · {item.pointValue} pt{item.pointValue > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <Info size={14} /> How It Works
        </h3>
        <ul className="text-xs text-muted-foreground space-y-1.5">
          <li>
            <strong>List items</strong> your kids have outgrown to earn points
          </li>
          <li>
            <strong>Claim items</strong> from other families using your points
          </li>
          <li>
            Points <strong>cannot be converted to money</strong>
          </li>
          <li>
            <strong>Star items</strong> (10 pts) are limited to 1 claim per 4 months
          </li>
          <li>
            <strong>Flag poor quality</strong> items — senders lose points
          </li>
        </ul>
      </div>
    </div>
  );
}
