import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";
import { playClick, playSuccess } from "@/lib/sounds";
import { ChevronRight, ChevronLeft, Check, X, ArrowRight } from "lucide-react";

const slides = [
  {
    title: "Welcome to KidSwap!",
    subtitle: "Trade kids items with families near you",
    content: (
      <div className="flex flex-col items-center gap-4">
        <div className="text-7xl animate-bounce-in">🔄</div>
        <p className="text-center text-muted-foreground max-w-sm">
          Kids grow fast. Their clothes and gear don't have to go to waste!
          List items you no longer need, earn points, and claim items from other families.
        </p>
      </div>
    ),
  },
  {
    title: "How Points Work",
    subtitle: "List items to earn, spend to claim",
    content: (
      <div className="space-y-4 max-w-sm mx-auto">
        <div className="flex items-start gap-3 p-3 bg-kidswap-teal/10 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-kidswap-teal text-white flex items-center justify-center font-bold shrink-0">
            1
          </div>
          <div>
            <p className="font-semibold text-sm">Basic Items — 1 point each</p>
            <p className="text-xs text-muted-foreground">
              T-shirts, onesies, socks, bibs, small toys. Always listed in bundles of <strong>at least 5</strong> (= 5+ points).
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-kidswap-purple/10 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-kidswap-purple text-white flex items-center justify-center font-bold shrink-0">
            5
          </div>
          <div>
            <p className="font-semibold text-sm">Plus Items — 5 points each</p>
            <p className="text-xs text-muted-foreground">
              Winter boots, snowsuits, baby carriers, quality shoes.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-kidswap-pink/10 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-kidswap-pink to-kidswap-orange text-white flex items-center justify-center font-bold shrink-0">
            ⭐
          </div>
          <div>
            <p className="font-semibold text-sm">Star Items — 10 points</p>
            <p className="text-xs text-muted-foreground">
              Strollers, car seats, cribs, skis. Local pickup only. Need 10 points + a star claim to buy.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Bundles Explained",
    subtitle: "Everything is listed as a bundle",
    content: (
      <div className="space-y-3 max-w-sm mx-auto">
        <div className="bg-kidswap-teal/10 border border-kidswap-teal/30 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">📦</span>
            <p className="font-semibold text-sm">Basic Bundle</p>
          </div>
          <p className="text-xs text-muted-foreground">
            At least <strong>5 basic items</strong> (1 pt each). So each bundle = <strong>5+ points</strong>.
            Example: 5 onesies, 6 t-shirts, etc.
          </p>
        </div>

        <div className="bg-kidswap-purple/10 border border-kidswap-purple/30 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">📦</span>
            <p className="font-semibold text-sm">Plus Bundle</p>
          </div>
          <p className="text-xs text-muted-foreground">
            One or more <strong>Plus items</strong> (5 pts each). Example: winter boots, baby carrier.
          </p>
        </div>

        <div className="bg-kidswap-orange/10 border border-kidswap-orange/30 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🔀</span>
            <p className="font-semibold text-sm">Mix Bundle</p>
          </div>
          <p className="text-xs text-muted-foreground">
            <strong>Combine</strong> Basic (1pt) and Plus (5pt) items in one bundle!
            Example: snow boots (5pts) + 5 warm layers (1pt each) = 10pts total.
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🏷️</span>
            <p className="font-semibold text-sm">Tag Your Bundle</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Add tags for <strong>activity/season</strong> (winter play, muddy weather, summer fun),
            <strong> gender</strong> (boys, girls, unisex), or <strong>age</strong> range so
            buyers can find exactly what they need.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "Star Claims",
    subtitle: "How to buy star items",
    content: (
      <div className="space-y-4 max-w-sm mx-auto">
        <div className="bg-kidswap-yellow/10 border border-kidswap-yellow/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            <p className="font-semibold">Star Item Claims</p>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            To buy a Star item (10 pts), you need <strong>10 points AND a star claim</strong>.
          </p>
          <p className="text-xs font-semibold text-kidswap-purple">How to earn star claims:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-kidswap-purple font-bold mt-0.5">1.</span>
              You get <strong>1 star claim every 4 months</strong> automatically
            </li>
            <li className="flex items-start gap-2">
              <span className="text-kidswap-purple font-bold mt-0.5">2.</span>
              List a star item yourself? <strong>+1 bonus star claim</strong>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-kidswap-purple font-bold mt-0.5">3.</span>
              List <strong>2 Plus items</strong>? <strong>+1 bonus star claim</strong>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-kidswap-purple font-bold mt-0.5">4.</span>
              Star items are <strong>local pickup only</strong> — no shipping
            </li>
          </ul>
        </div>
        <p className="text-xs text-center text-muted-foreground">
          Points cannot be converted to money — they can only be spent on KidSwap.
        </p>
      </div>
    ),
  },
  {
    title: "Quality Standards",
    subtitle: "Only list items that meet our standards",
    content: (
      <div className="space-y-4 max-w-sm mx-auto">
        <div className="grid grid-cols-2 gap-3">
          <div className="border-2 border-kidswap-green rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-1 text-kidswap-green font-bold text-sm">
              <Check size={16} /> Acceptable
            </div>
            <div className="space-y-2">
              <div className="bg-kidswap-green/5 rounded-lg p-2 text-center">
                <span className="text-3xl">👕</span>
                <p className="text-[10px] mt-1 text-muted-foreground">Clean, no stains</p>
              </div>
              <div className="bg-kidswap-green/5 rounded-lg p-2 text-center">
                <span className="text-3xl">👟</span>
                <p className="text-[10px] mt-1 text-muted-foreground">Good tread left</p>
              </div>
              <div className="bg-kidswap-green/5 rounded-lg p-2 text-center">
                <span className="text-3xl">🧸</span>
                <p className="text-[10px] mt-1 text-muted-foreground">Fully functional</p>
              </div>
            </div>
          </div>

          <div className="border-2 border-red-400 rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-1 text-red-500 font-bold text-sm">
              <X size={16} /> Not OK
            </div>
            <div className="space-y-2">
              <div className="bg-red-50 rounded-lg p-2 text-center">
                <span className="text-3xl">🟤</span>
                <p className="text-[10px] mt-1 text-muted-foreground">Stained items</p>
              </div>
              <div className="bg-red-50 rounded-lg p-2 text-center">
                <span className="text-3xl">🧵</span>
                <p className="text-[10px] mt-1 text-muted-foreground">Torn or ripped</p>
              </div>
              <div className="bg-red-50 rounded-lg p-2 text-center">
                <span className="text-3xl">💀</span>
                <p className="text-[10px] mt-1 text-muted-foreground">Worn out / expired</p>
              </div>
            </div>
          </div>
        </div>
        <p className="text-xs text-center text-muted-foreground">
          Items that don't meet standards can be flagged. Senders lose points for flagged items!
        </p>
      </div>
    ),
  },
  {
    title: "Shipping & Pickup",
    subtitle: "How items get to you",
    content: (
      <div className="space-y-4 max-w-sm mx-auto">
        <div className="flex items-start gap-3 p-4 bg-kidswap-blue/10 rounded-xl">
          <span className="text-3xl">📦</span>
          <div>
            <p className="font-semibold text-sm">Regular Bundles (1 & 5 pts)</p>
            <p className="text-xs text-muted-foreground">
              Shipped to you! The receiver pays a small shipping fee.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 bg-kidswap-yellow/10 rounded-xl">
          <span className="text-3xl">📍</span>
          <div>
            <p className="font-semibold text-sm">Star Items (10 pts)</p>
            <p className="text-xs text-muted-foreground">
              Local pickup only — no shipping for big items like strollers and car seats.
            </p>
          </div>
        </div>
        <div className="text-center mt-6">
          <p className="font-semibold text-kidswap-purple">You start with 5 bonus points!</p>
          <p className="text-xs text-muted-foreground mt-1">
            Start browsing and claim your first items.
          </p>
        </div>
      </div>
    ),
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const completeOnboarding = useStore((s) => s.completeOnboarding);

  const isLast = step === slides.length - 1;
  const slide = slides[step];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 pt-6 pb-2">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all ${
              i === step
                ? "w-6 bg-kidswap-purple"
                : i < step
                ? "w-2 bg-kidswap-purple/40"
                : "w-2 bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4">
        <div className="animate-slide-up" key={step}>
          <h1 className="text-2xl font-bold text-center mb-1">{slide.title}</h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            {slide.subtitle}
          </p>
          {slide.content}
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 pb-8 flex gap-3">
        {step > 0 && (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              playClick();
              setStep(step - 1);
            }}
          >
            <ChevronLeft size={16} className="mr-1" /> Back
          </Button>
        )}
        <Button
          className={`flex-1 ${
            isLast
              ? "bg-kidswap-green hover:bg-kidswap-green/90"
              : "bg-kidswap-purple hover:bg-kidswap-purple/90"
          }`}
          onClick={() => {
            playClick();
            if (isLast) {
              playSuccess();
              completeOnboarding();
            } else {
              setStep(step + 1);
            }
          }}
        >
          {isLast ? (
            <>
              Get Started! <ArrowRight size={16} className="ml-1" />
            </>
          ) : (
            <>
              Next <ChevronRight size={16} className="ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
