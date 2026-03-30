import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Star,
  Package,
  ShoppingBag,
  TrendingUp,
  RotateCcw,
  Info,
  Pencil,
  AlertTriangle,
  LogOut,
  Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function Profile() {
  const { user, items, getStarClaimsRemaining, updateUser, logout } = useStore();
  const { signOut } = useAuth();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: user.firstName || "",
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    address: user.address || "",
  });

  const myListings = items.filter((i) => i.sellerId === user.id);
  const starClaimsRemaining = getStarClaimsRemaining();
  const totalStarAllowed = user.starClaimLimit + user.bonusStarClaims;

  const profileComplete = user.firstName && user.email && user.phone && user.address;

  const handleSaveProfile = () => {
    if (!editForm.firstName.trim() || !editForm.email.trim() || !editForm.phone.trim() || !editForm.address.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    updateUser({
      firstName: editForm.firstName.trim(),
      name: editForm.firstName.trim(),
      email: editForm.email.trim(),
      phone: editForm.phone.trim(),
      address: editForm.address.trim(),
    });
    setShowEditDialog(false);
    toast.success("Profile updated!");
  };

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
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-kidswap-purple to-kidswap-teal flex items-center justify-center text-white text-2xl font-bold">
          {(user.firstName || user.name).charAt(0)}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{user.firstName || user.name}</h1>
          <p className="text-sm text-muted-foreground">
            Member since {new Date(user.joinedAt).toLocaleDateString()}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => {
            setEditForm({
              firstName: user.firstName || "",
              name: user.name || "",
              email: user.email || "",
              phone: user.phone || "",
              address: user.address || "",
            });
            setShowEditDialog(true);
          }}
        >
          <Pencil size={14} className="mr-1" /> Edit
        </Button>
      </div>

      {/* Profile completion warning */}
      {!profileComplete && (
        <div className="bg-kidswap-orange/10 border border-kidswap-orange/30 rounded-xl p-3 mb-4 flex items-start gap-2">
          <AlertTriangle size={16} className="text-kidswap-orange mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium">Complete your profile</p>
            <p className="text-xs text-muted-foreground">
              Add your name, email, phone and address so other swappers can reach you when items are claimed.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-2 text-xs"
              onClick={() => {
                setEditForm({
                  firstName: user.firstName || "",
                  name: user.name || "",
                  email: user.email || "",
                  phone: user.phone || "",
                  address: user.address || "",
                });
                setShowEditDialog(true);
              }}
            >
              Complete Profile
            </Button>
          </div>
        </div>
      )}

      {/* Account status warnings */}
      {user.isSuspended && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex items-start gap-2">
          <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-700">Account Suspended</p>
            <p className="text-xs text-red-600">
              Your account has been suspended due to multiple warnings. Please contact support.
            </p>
          </div>
        </div>
      )}

      {(user.qualityWarnings > 0 || user.shippingWarnings > 0) && !user.isSuspended && (
        <div className="bg-kidswap-yellow/10 border border-kidswap-yellow/30 rounded-xl p-3 mb-4 flex items-start gap-2">
          <AlertTriangle size={16} className="text-kidswap-yellow mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium">Account Warnings</p>
            {user.qualityWarnings > 0 && (
              <p className="text-xs text-muted-foreground">Quality warnings: {user.qualityWarnings}</p>
            )}
            {user.shippingWarnings > 0 && (
              <p className="text-xs text-muted-foreground">Shipping warnings: {user.shippingWarnings}</p>
            )}
          </div>
        </div>
      )}

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

      {/* Contact Info */}
      {profileComplete && (
        <div className="bg-gray-50 rounded-2xl p-4 mb-6">
          <h3 className="font-bold text-sm mb-2">Contact Info</h3>
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Name:</strong> {user.firstName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.phone}</p>
            <p><strong>Address:</strong> {user.address}</p>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 italic">
            Your first name and phone are shared with other swappers when an exchange is made.
          </p>
        </div>
      )}

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
            <strong>Bundle items</strong> must add up to at least 5 points
          </li>
          <li>
            <strong>Star items</strong> (10 pts) are limited to 1 claim per 4 months
          </li>
          <li>
            <strong>Rate quality</strong> after each exchange — poor ratings lead to warnings
          </li>
        </ul>
      </div>

      {/* Dev: Admin toggle */}
      <div className="mt-6 flex items-center justify-between bg-gray-50 rounded-xl p-3">
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-kidswap-purple" />
          <span className="text-xs font-medium text-gray-600">Admin mode</span>
          <Badge variant="outline" className="text-[9px]">DEV</Badge>
        </div>
        <button
          onClick={() => updateUser({ isAdmin: !user.isAdmin })}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            user.isAdmin ? "bg-kidswap-purple" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
              user.isAdmin ? "translate-x-5" : ""
            }`}
          />
        </button>
      </div>

      {/* Logout */}
      <Button
        variant="outline"
        className="w-full mt-6 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
        onClick={async () => {
          await signOut();
          logout();
        }}
      >
        <LogOut size={16} className="mr-2" />
        Log out
      </Button>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="firstName" className="text-sm">First Name *</Label>
              <Input
                id="firstName"
                placeholder="Your first name"
                value={editForm.firstName}
                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-sm">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 555-0123"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="address" className="text-sm">Address *</Label>
              <Input
                id="address"
                placeholder="Your mailing address"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                className="mt-1"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              Your first name and phone number become visible to the other party when an exchange is made.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button
              className="bg-kidswap-purple hover:bg-kidswap-purple/90"
              onClick={handleSaveProfile}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
