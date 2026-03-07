import { useEffect, useState } from "react";

interface PointsAnimationProps {
  amount: number;
  type: "earn" | "spend";
  trigger: boolean;
}

export function PointsAnimation({ amount, type, trigger }: PointsAnimationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (trigger) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (!visible) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="animate-slide-up">
        <div
          className={`text-3xl font-bold px-6 py-3 rounded-full shadow-lg ${
            type === "earn"
              ? "bg-kidswap-green text-white"
              : "bg-kidswap-orange text-white"
          }`}
        >
          {type === "earn" ? "+" : "-"}{amount} {amount === 1 ? "point" : "points"}!
        </div>
      </div>
    </div>
  );
}
