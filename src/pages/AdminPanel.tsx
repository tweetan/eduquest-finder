import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Shield,
  AlertTriangle,
  Flag,
  Users,
  CheckCircle,
  XCircle,
  Ban,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import type { SupportTicket, FlagReport, Item } from "@/types";

type Tab = "tickets" | "flags" | "users";

export default function AdminPanel() {
  const { supportTickets, flags, items, user } = useStore();
  const [activeTab, setActiveTab] = useState<Tab>("tickets");

  if (!user.isAdmin) {
    return (
      <div className="pb-20 pt-2 px-4 max-w-lg mx-auto text-center py-20">
        <Shield className="h-12 w-12 mx-auto text-gray-300 mb-4" />
        <h2 className="text-lg font-bold text-gray-500">Admin Access Required</h2>
        <p className="text-sm text-muted-foreground mt-2">
          You don't have permission to view this page.
        </p>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    {
      id: "tickets",
      label: "Tickets",
      icon: <AlertTriangle size={16} />,
      count: supportTickets.filter((t) => t.status === "pending").length,
    },
    {
      id: "flags",
      label: "Flags",
      icon: <Flag size={16} />,
      count: flags.length,
    },
    {
      id: "users",
      label: "Users",
      icon: <Users size={16} />,
      count: 0,
    },
  ];

  return (
    <div className="pb-20 pt-2 px-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Shield size={20} className="text-kidswap-purple" />
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-kidswap-purple text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "tickets" && <TicketsTab />}
      {activeTab === "flags" && <FlagsTab />}
      {activeTab === "users" && <UsersTab />}
    </div>
  );
}

// ── Tickets Tab ──────────────────────────────────────────────

function TicketsTab() {
  const { supportTickets } = useStore();
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  const pendingTickets = supportTickets.filter((t) => t.status === "pending");
  const reviewedTickets = supportTickets.filter((t) => t.status === "reviewed");

  return (
    <div className="space-y-4">
      {/* Pending */}
      <div>
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">
          Pending ({pendingTickets.length})
        </h2>
        {pendingTickets.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No pending tickets. All clear!
          </p>
        ) : (
          <div className="space-y-2">
            {pendingTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onView={() => setSelectedTicket(ticket)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reviewed */}
      {reviewedTickets.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">
            Reviewed ({reviewedTickets.length})
          </h2>
          <div className="space-y-2">
            {reviewedTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onView={() => setSelectedTicket(ticket)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Ticket detail dialog */}
      <TicketDetailDialog
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
      />
    </div>
  );
}

function TicketCard({ ticket, onView }: { ticket: SupportTicket; onView: () => void }) {
  return (
    <div className="bg-white border rounded-xl p-3 flex items-start gap-3">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          ticket.type === "low-quality"
            ? "bg-orange-100 text-orange-600"
            : "bg-red-100 text-red-600"
        }`}
      >
        {ticket.type === "low-quality" ? (
          <AlertTriangle size={14} />
        ) : (
          <XCircle size={14} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge
            variant={ticket.type === "low-quality" ? "secondary" : "destructive"}
            className="text-[10px]"
          >
            {ticket.type === "low-quality" ? "Quality" : "Conduct"}
          </Badge>
          <Badge
            variant={ticket.status === "pending" ? "outline" : "default"}
            className="text-[10px]"
          >
            {ticket.status}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {ticket.description}
        </p>
        <p className="text-[10px] text-muted-foreground mt-1">
          {new Date(ticket.createdAt).toLocaleDateString()}
        </p>
      </div>
      <Button variant="ghost" size="sm" onClick={onView}>
        <Eye size={14} />
      </Button>
    </div>
  );
}

function TicketDetailDialog({
  ticket,
  onClose,
}: {
  ticket: SupportTicket | null;
  onClose: () => void;
}) {
  const { supportTickets } = useStore();
  const updateTicketLocally = useStore((s) => s.resolveTicket);

  if (!ticket) return null;

  const handleResolve = () => {
    updateTicketLocally(ticket.id);
    toast.success("Ticket marked as reviewed");
    onClose();
  };

  return (
    <Dialog open={!!ticket} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle size={18} />
            Support Ticket
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-gray-500">Type</p>
            <Badge
              variant={ticket.type === "low-quality" ? "secondary" : "destructive"}
            >
              {ticket.type === "low-quality" ? "Low Quality" : "Disrespectful Exchange"}
            </Badge>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Description</p>
            <p className="text-sm">{ticket.description}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Claim ID</p>
            <p className="text-xs font-mono text-muted-foreground">{ticket.claimId}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Created</p>
            <p className="text-sm">{new Date(ticket.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Status</p>
            <Badge variant={ticket.status === "pending" ? "outline" : "default"}>
              {ticket.status}
            </Badge>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {ticket.status === "pending" && (
            <Button
              className="bg-kidswap-green hover:bg-kidswap-green/90"
              onClick={handleResolve}
            >
              <CheckCircle size={14} className="mr-1" />
              Mark Reviewed
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Flags Tab ────────────────────────────────────────────────

function FlagsTab() {
  const { flags, items } = useStore();

  if (flags.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        No flagged items.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {flags.map((flag) => {
        const item = items.find((i) => i.id === flag.itemId);
        return (
          <FlagCard key={flag.id} flag={flag} item={item} />
        );
      })}
    </div>
  );
}

function FlagCard({ flag, item }: { flag: FlagReport; item?: Item }) {
  const { removeItem } = useStore();

  return (
    <div className="bg-white border rounded-xl p-3">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
          <Flag size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{item?.title || "Unknown item"}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{flag.reason}</p>
          <p className="text-[10px] text-muted-foreground mt-1">
            {new Date(flag.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      {item && item.status === "flagged" && (
        <div className="flex gap-2 mt-3 ml-11">
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={() => {
              useStore.getState().updateItemStatus(item.id, "available");
              toast.success("Item restored");
            }}
          >
            <CheckCircle size={12} className="mr-1" />
            Restore
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="text-xs"
            onClick={() => {
              removeItem(item.id);
              toast.success("Item removed");
            }}
          >
            <XCircle size={12} className="mr-1" />
            Remove Item
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Users Tab ────────────────────────────────────────────────

function UsersTab() {
  const { items } = useStore();
  const [confirmAction, setConfirmAction] = useState<{
    type: "warn" | "suspend" | "unsuspend";
    sellerId: string;
    sellerName: string;
  } | null>(null);

  // Build a list of unique sellers from items (since we don't have a full user list in local store)
  const sellerMap = new Map<string, { id: string; name: string; itemCount: number }>();
  for (const item of items) {
    const existing = sellerMap.get(item.sellerId);
    if (existing) {
      existing.itemCount++;
    } else {
      sellerMap.set(item.sellerId, {
        id: item.sellerId,
        name: item.sellerName,
        itemCount: 1,
      });
    }
  }
  const sellers = Array.from(sellerMap.values());

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground mb-3">
        Users who have listed items. Full user management requires Supabase admin access.
      </p>
      {sellers.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No users found.
        </p>
      ) : (
        sellers.map((seller) => (
          <div
            key={seller.id}
            className="bg-white border rounded-xl p-3 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-kidswap-purple to-kidswap-teal flex items-center justify-center text-white font-bold">
              {seller.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{seller.name}</p>
              <p className="text-xs text-muted-foreground">
                {seller.itemCount} item{seller.itemCount !== 1 ? "s" : ""} listed
              </p>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                className="text-xs text-orange-600 border-orange-200 hover:bg-orange-50"
                onClick={() =>
                  setConfirmAction({ type: "warn", sellerId: seller.id, sellerName: seller.name })
                }
              >
                <AlertTriangle size={12} className="mr-1" />
                Warn
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                onClick={() =>
                  setConfirmAction({ type: "suspend", sellerId: seller.id, sellerName: seller.name })
                }
              >
                <Ban size={12} className="mr-1" />
                Suspend
              </Button>
            </div>
          </div>
        ))
      )}

      {/* Confirm action dialog */}
      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.type === "warn" ? "Issue Warning" : "Suspend Account"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm">
            Are you sure you want to{" "}
            {confirmAction?.type === "warn" ? "issue a warning to" : "suspend"}{" "}
            <strong>{confirmAction?.sellerName}</strong>?
          </p>
          {confirmAction?.type === "suspend" && (
            <p className="text-xs text-red-600">
              This will prevent the user from claiming any items.
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              Cancel
            </Button>
            <Button
              variant={confirmAction?.type === "warn" ? "default" : "destructive"}
              onClick={() => {
                if (confirmAction) {
                  toast.success(
                    confirmAction.type === "warn"
                      ? `Warning issued to ${confirmAction.sellerName}`
                      : `${confirmAction.sellerName}'s account suspended`
                  );
                  setConfirmAction(null);
                }
              }}
            >
              {confirmAction?.type === "warn" ? "Issue Warning" : "Suspend"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
