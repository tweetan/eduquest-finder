import { Link, useLocation } from "react-router-dom";
import { Home, PlusCircle, User, ShoppingBag, HelpCircle } from "lucide-react";
import { useStore } from "@/store/useStore";

export function NavBar() {
  const location = useLocation();
  const user = useStore((s) => s.user);

  const links = [
    { to: "/", icon: Home, label: "Browse" },
    { to: "/list", icon: PlusCircle, label: "List" },
    { to: "/claims", icon: ShoppingBag, label: "Claims" },
    { to: "/profile", icon: User, label: "Profile" },
    { to: "/how-to-swap", icon: HelpCircle, label: "How to Swap" },
  ];

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🔄</span>
            <span className="font-bold text-xl bg-gradient-to-r from-kidswap-purple to-kidswap-teal bg-clip-text text-transparent">
              KidSwap
            </span>
          </Link>
          <div className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1.5">
            <div className="w-5 h-5 rounded-full bg-kidswap-yellow flex items-center justify-center text-xs font-bold">
              ⚡
            </div>
            <span className="font-bold text-sm">{user.points}</span>
            <span className="text-xs text-muted-foreground">pts</span>
          </div>
        </div>
      </header>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 pb-safe">
        <div className="max-w-lg mx-auto flex justify-around py-2">
          {links.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                  active
                    ? "text-kidswap-purple"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                <span className="text-[9px] font-medium leading-tight text-center">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
