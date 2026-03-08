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
            <p className="font-semibold text-sm">Basic Items — 1 point</p>
            <p className="text-xs text-muted-foreground">
              T-shirts, onesies, socks, bibs, small toys. List in bulk!
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-kidswap-purple/10 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-kidswap-purple text-white flex items-center justify-center font-bold shrink-0">
            5
          </div>
          <div>
            <p className="font-semibold text-sm">Plus Items — 5 points</p>
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
              Strollers, car seats, cribs, skis. Local pickup only. Limited to 1 claim per 4 months.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Star Item Rules",
    subtitle: "Big items, special rules",
    content: (
      <div className="space-y-4 max-w-sm mx-auto">
        <div className="bg-kidswap-yellow/10 border border-kidswap-yellow/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            <p className="font-semibold">Star Item Claims</p>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-kidswap-purple font-bold mt-0.5">1.</span>
              You can claim <strong>1 star item every 4 months</strong>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-kidswap-purple font-bold mt-0.5">2.</span>
              List a star item yourself? You get <strong>1 bonus star claim</strong>!
            </li>
            <li className="flex items-start gap-2">
              <span className="text-kidswap-purple font-bold mt-0.5">3.</span>
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
            <p className="font-semibold text-sm">Regular Items (1 & 5 pts)</p>
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
