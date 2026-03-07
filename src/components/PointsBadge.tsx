import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface PointsBadgeProps {
  points: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  showStar?: boolean;
}

const sizeClasses = {
  sm: "h-6 min-w-6 px-1 text-xs",
  md: "h-8 min-w-8 px-1.5 text-sm",
  lg: "h-12 min-w-12 px-2 text-lg",
};

function getColorClass(points: number): string {
  if (points >= 10) return "bg-gradient-to-br from-kidswap-pink to-kidswap-orange text-white";
  if (points >= 5) return "bg-kidswap-purple text-white";
  return "bg-kidswap-teal text-white";
}

export function PointsBadge({ points, size = "md", className, showStar }: PointsBadgeProps) {
  const isStar = points >= 10 || showStar;

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold relative",
        sizeClasses[size],
        getColorClass(points),
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
