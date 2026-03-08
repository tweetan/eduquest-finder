import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { playClick } from "@/lib/sounds";
import { ChevronRight, ChevronLeft, Check, X, ArrowLeft } from "lucide-react";

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
            📦
          </div>
          <div>
            <p className="font-semibold text-sm">Bundle — 5+ points</p>
            <p className="text-xs text-muted-foreground">
              Combine multiple small items (t-shirts, onesies, socks) into a bundle worth at least 5 points.
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
    title: "How Swapping Works",
    subtitle: "From listing to exchange",
    content: (
      <div className="space-y-4 max-w-sm mx-auto">
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-kidswap-purple text-white flex items-center justify-center font-bold text-sm shrink-0">1</div>
            <div>
              <p className="font-semibold text-sm">List your items</p>
              <p className="text-xs text-muted-foreground">Bundle small items or list larger ones individually. Min 5 points per listing.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-kidswap-purple text-white flex items-center justify-center font-bold text-sm shrink-0">2</div>
            <div>
              <p className="font-semibold text-sm">Someone claims your listing</p>
              <p className="text-xs text-muted-foreground">They get your contact details to arrange shipping or pickup.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-kidswap-purple text-white flex items-center justify-center font-bold text-sm shrink-0">3</div>
            <div>
              <p className="font-semibold text-sm">Exchange & rate</p>
              <p className="text-xs text-muted-foreground">Both parties click "Done" within 1 month. Rate the quality and experience.</p>
            </div>
          </div>
        </div>
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
            </div>
          </div>
        </div>
        <div className="bg-kidswap-yellow/10 border border-kidswap-yellow/30 rounded-xl p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Rating & warnings</p>
          <p>After an exchange, the receiver rates quality (1-5). Ratings below 3 are reviewed by our team. Repeated poor ratings lead to account warnings and eventual suspension.</p>
        </div>
      </div>
    ),
  },
];

export default function HowToSwap() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const isLast = step === slides.length - 1;
  const slide = slides[step];

  return (
    <div className="pb-20 pt-2 px-4 max-w-lg mx-auto flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Header */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2 self-start"
      >
        <ArrowLeft size={16} /> Back to Browse
      </button>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 pb-4">
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
      <div className="flex-1 flex flex-col items-center justify-center py-4">
        <div className="animate-slide-up" key={step}>
          <h1 className="text-2xl font-bold text-center mb-1">{slide.title}</h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            {slide.subtitle}
          </p>
          {slide.content}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
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
              navigate("/");
            } else {
              setStep(step + 1);
            }
          }}
        >
          {isLast ? (
            <>Got it!</>
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
