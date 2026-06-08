import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Users, Calendar, TrendingUp, CheckCircle2, XCircle, Clock, MoreVertical, Plus, Loader2, Pencil, Trash2 } from "lucide-react";
import type { CollegeEvent } from "@/lib/events-data";
import {
  approveEvent,
  deleteEvent,
  fetchEvents,
  fetchPendingApprovalEvents,
  rejectEvent,
} from "@/lib/api/events";
import { authService } from "@/lib/api/auth";
import { ROLE_COLLEGE_ADMIN, ROLE_SUPER_ADMIN, isSuperAdminRole } from "@/lib/auth/roles";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  approveCollaborationRequest,
  fetchCollaborationRequests,
  rejectCollaborationRequest,
  type CollaborationRequest,
} from "@/lib/api/collaborations";
import { CreateEventDialog } from "@/components/admin/CreateEventDialog";
import { EditEventDialog } from "@/components/admin/EditEventDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RequireAdmin } from "@/components/auth/RequireAdmin";
import { formatCalendarDateMedium } from "@/lib/format-calendar-date";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — MU Events" }] }),
  component: AdminPage,
});

function statusBadgeClass(status?: string) {
  const s = (status || "").toUpperCase();
  if (s === "APPROVED" || s === "COMPLETED") return "bg-success/15 text-success";
  if (s === "DRAFT") return "bg-muted text-muted-foreground";
  if (s === "PENDING_APPROVAL") return "bg-amber-500/15 text-amber-700 dark:text-amber-400";
  if (s === "REJECTED" || s === "CANCELLED") return "bg-destructive/10 text-destructive";
  return "bg-secondary text-secondary-foreground";
}

function formatRequestDate(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function AdminPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<CollegeEvent | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [approvedEvents, setApprovedEvents] = useState<CollegeEvent[]>([]);
  const [pendingEvents, setPendingEvents] = useState<CollegeEvent[]>([]);
  const [collaborationRequests, setCollaborationRequests] = useState<CollaborationRequest[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CollegeEvent | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const currentRole = authService.getCurrentUser()?.role;
  const isSystemAdmin = isSuperAdminRole(currentRole);
  const canApproveEvents = authService.hasAnyRole([ROLE_COLLEGE_ADMIN, ROLE_SUPER_ADMIN]);

  const showFeedback = (title: string, message: string) => {
    setFeedbackTitle(title);
    setFeedbackMessage(message);
    setFeedbackOpen(true);
  };

  const loadApprovedEvents = useCallback(async () => {
    try {
      const list = await fetchEvents({ status: "APPROVED", page: 0, size: 200 });
      setApprovedEvents(list);
      setListError(null);
    } catch {
      setListError("Could not load approved events from API.");
      setApprovedEvents([]);
    }
  }, []);

  const loadPending = useCallback(async () => {
    try {
      const [eventsPending, collabPending] = await Promise.all([
        fetchPendingApprovalEvents(),
        fetchCollaborationRequests({ status: "PENDING", page: 0, size: 50 }),
      ]);
      setPendingEvents(eventsPending);
      setCollaborationRequests(collabPending);
    } catch {
      setPendingEvents([]);
      setCollaborationRequests([]);
    }
  }, []);

  useEffect(() => {
    void loadApprovedEvents();
    void loadPending();
  }, [loadApprovedEvents, loadPending]);

  async function handleApproveEvent(eventId: string) {
    setActionLoading(`event-approve-${eventId}`);
    try {
      await approveEvent(eventId);
      toast.success("Event approved");
      showFeedback("Approved", "The event is now live on the portal.");
      await Promise.all([loadApprovedEvents(), loadPending()]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not approve event.";
      toast.error(msg);
      showFeedback("Approval failed", msg);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRejectEvent(eventId: string) {
    const reason = globalThis.prompt("Rejection reason (optional):") ?? "Rejected by admin";
    setActionLoading(`event-reject-${eventId}`);
    try {
      await rejectEvent(eventId, reason);
      toast.success("Event rejected");
      showFeedback("Rejected", "The event was removed from the approval queue.");
      await Promise.all([loadApprovedEvents(), loadPending()]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not reject event.";
      toast.error(msg);
      showFeedback("Rejection failed", msg);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleApproveCollaboration(id: number) {
    setActionLoading(`collab-approve-${id}`);
    try {
      await approveCollaborationRequest(id);
      await loadPending();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not approve collaboration.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRejectCollaboration(id: number) {
    const reason = globalThis.prompt("Rejection reason (optional):") ?? "Rejected by admin";
    setActionLoading(`collab-reject-${id}`);
    try {
      await rejectCollaborationRequest(id, reason);
      await loadPending();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not reject collaboration.");
    } finally {
      setActionLoading(null);
    }
  }

  const pendingTotal = pendingEvents.length + collaborationRequests.length;
  const activeEvents = approvedEvents.length;
  const totalRegistrations = approvedEvents.reduce((sum, e) => sum + (e.seatsTotal - e.seatsLeft), 0);

  async function confirmDeleteEvent() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    const title = deleteTarget.title;
    setActionLoading(`delete-${id}`);
    try {
      const msg = await deleteEvent(id);
      setDeleteTarget(null);
      toast.success(msg);
      showFeedback("Deleted", `"${title}" was deleted successfully.`);
      await loadApprovedEvents();
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "Delete failed.";
      toast.error(errMsg);
      showFeedback("Delete failed", errMsg);
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <RequireAdmin>
    <section className="py-10 bg-secondary/30 min-h-screen">
      <div className="container-page">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-1">Admin Console</p>
            <h1 className="font-display text-3xl md:text-4xl font-bold">Events & Operations</h1>
            {isSystemAdmin ? (
              <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
                Signed in as <span className="font-semibold text-foreground">System Admin (SUPER_ADMIN)</span> — full access:
                create/edit/delete events, approve & reject, collaboration requests, and onboarding check-in.
                Student Dashboard is hidden for this role.
              </p>
            ) : null}
            {listError ? <p className="text-sm text-amber-700 dark:text-amber-400 mt-2">{listError}</p> : null}
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Create Event
          </button>
        </div>

        <CreateEventDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={() => { void loadApprovedEvents(); void loadPending(); }} />
        <EditEventDialog
          event={editEvent}
          open={editOpen}
          onOpenChange={(o) => {
            setEditOpen(o);
            if (!o) setEditEvent(null);
          }}
          onUpdated={() => void loadApprovedEvents()}
        />

        <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete event?</AlertDialogTitle>
              <AlertDialogDescription>
                Delete &quot;{deleteTarget?.title}&quot;? This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => void confirmDeleteEvent()}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{feedbackTitle}</AlertDialogTitle>
              <AlertDialogDescription>{feedbackMessage}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction>OK</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Calendar, label: "Active Events", value: String(activeEvents), change: `${approvedEvents.length} approved` },
            { icon: Users, label: "Total Registrations", value: String(totalRegistrations), change: "From seat counts" },
            { icon: TrendingUp, label: "Approved Events", value: String(activeEvents), change: "Live on portal" },
            { icon: Clock, label: "Pending Approvals", value: String(pendingTotal), change: `${collaborationRequests.length} collaboration` },
          ].map((s, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <s.icon className="h-5 w-5 text-primary" />
                <span className="text-[10px] uppercase tracking-wider text-success font-semibold">{s.change}</span>
              </div>
              <div className="font-display text-3xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 mb-8">
          <h2 className="font-display text-xl font-bold mb-1">Pending Event Approvals</h2>
          <p className="text-xs text-muted-foreground mb-5">Draft and pending events — approve or reject to publish.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-2">Event</th>
                  <th className="py-2">Category</th>
                  <th className="py-2">Organizer</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Status</th>
                  <th className="py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-muted-foreground">No draft or pending events.</td>
                  </tr>
                ) : (
                  pendingEvents.map((r) => (
                    <tr key={r.id} className="border-b border-border last:border-0">
                      <td className="py-3 pr-4 font-medium">{r.title}</td>
                      <td className="py-3 pr-4">{r.category}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{r.organizer}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{formatCalendarDateMedium(r.date)}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded ${statusBadgeClass(r.approvalStatus)}`}>
                          {r.approvalStatus || "—"}
                        </span>
                      </td>
                      <td className="py-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          disabled={actionLoading !== null || !canApproveEvents}
                          title={canApproveEvents ? undefined : "Only College Admin or Super Admin can approve"}
                          onClick={() => void handleApproveEvent(r.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-success/15 text-success rounded-md hover:bg-success/25 mr-1 disabled:opacity-50"
                        >
                          {actionLoading === `event-approve-${r.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={actionLoading !== null || !canApproveEvents}
                          title={canApproveEvents ? undefined : "Only College Admin or Super Admin can reject"}
                          onClick={() => void handleRejectEvent(r.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-destructive/10 text-destructive rounded-md hover:bg-destructive/20 disabled:opacity-50"
                        >
                          {actionLoading === `event-reject-${r.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!canApproveEvents ? (
            <p className="text-xs text-muted-foreground mt-4">Organizers can submit events; approval requires College Admin or Super Admin.</p>
          ) : null}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 mb-8">
          <h2 className="font-display text-xl font-bold mb-5">Collaboration Requests</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-2">Requester</th>
                  <th className="py-2">Partner</th>
                  <th className="py-2">Coordinator</th>
                  <th className="py-2">Notes</th>
                  <th className="py-2">Submitted</th>
                  <th className="py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {collaborationRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-muted-foreground">No pending collaboration requests.</td>
                  </tr>
                ) : (
                  collaborationRequests.map((r) => (
                    <tr key={r.id} className="border-b border-border last:border-0 align-top">
                      <td className="py-3 pr-4 font-medium">{r.requesterCollege?.name ?? "—"}</td>
                      <td className="py-3 pr-4">{r.partnerCollege?.name ?? "—"}</td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        <div className="font-medium text-foreground">{r.coordinatorName || "—"}</div>
                        {r.coordinatorEmail ? <div className="text-xs">{r.coordinatorEmail}</div> : null}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground max-w-xs">
                        <p className="line-clamp-3 whitespace-pre-wrap">{r.notes || r.specialOffers || "—"}</p>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">{formatRequestDate(r.requestDate)}</td>
                      <td className="py-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          disabled={actionLoading !== null}
                          onClick={() => void handleApproveCollaboration(r.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-success/15 text-success rounded-md hover:bg-success/25 mr-1 disabled:opacity-50"
                        >
                          {actionLoading === `collab-approve-${r.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={actionLoading !== null}
                          onClick={() => void handleRejectCollaboration(r.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-destructive/10 text-destructive rounded-md hover:bg-destructive/20 disabled:opacity-50"
                        >
                          {actionLoading === `collab-reject-${r.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <h2 className="font-display text-xl font-bold">All Events</h2>
            <span className="text-xs text-muted-foreground">Approved only</span>
            <p className="text-xs text-muted-foreground">
              Need access?{" "}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Sign in
              </Link>{" "}
              as College Admin, Organizer, or Super Admin.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-2">Event</th>
                  <th className="py-2">Category</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Registrations</th>
                  <th className="py-2">Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {approvedEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No approved events yet.
                    </td>
                  </tr>
                ) : null}
                {approvedEvents.map((e) => {
                  const reg = e.seatsTotal - e.seatsLeft;
                  const statusLabel = e.approvalStatus || "—";
                  return (
                    <tr key={e.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                      <td className="py-3 pr-4 font-medium">{e.title}</td>
                      <td className="py-3 pr-4">{e.category}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{formatCalendarDateMedium(e.date)}</td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold">
                            {reg}/{e.seatsTotal}
                          </span>
                          <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${e.seatsTotal ? (reg / e.seatsTotal) * 100 : 0}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded ${statusBadgeClass(e.approvalStatus)}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button type="button" className="p-1.5 hover:bg-secondary rounded" aria-label="Event actions">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditEvent(e);
                                setEditOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteTarget(e)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
    </RequireAdmin>
  );
}
