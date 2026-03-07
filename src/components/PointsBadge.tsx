import { cn } from "@/lib/utils";
import type { PointTier } from "@/types";
import { Star } from "lucide-react";

interface PointsBadgeProps {
  points: PointTier;
  size?: "sm" | "md" | "lg";
  className?: string;
  showStar?: boolean;
}

const sizeClasses = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-12 w-12 text-lg",
};

const colorClasses: Record<PointTier, string> = {
  1: "bg-kidswap-teal text-white",
  5: "bg-kidswap-purple text-white",
  10: "bg-gradient-to-br from-kidswap-pink to-kidswap-orange text-white",
};

export function PointsBadge({ points, size = "md", className, showStar }: PointsBadgeProps) {
  const isStar = points === 10 || showStar;

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold relative",
        sizeClasses[size],
        colorClasses[points],
        isStar && "animate-star-pulse",
        className
      )}
    >
      {points}
      {isStar && (
        <Star
          className="absolute -top-1 -right-1 text-kidswap-yellow fill-kidswap-yellow"
          size={size === "sm" ? 10 : size === "md" ? 14 : 18}
        />
      )}
    </div>
  );
}
