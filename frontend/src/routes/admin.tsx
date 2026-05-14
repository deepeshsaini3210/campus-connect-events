import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Users, Calendar, TrendingUp, CheckCircle2, XCircle, Clock, MoreVertical, Plus } from "lucide-react";
import { events as fallbackEvents, type CollegeEvent } from "@/lib/events-data";
import { fetchEvents } from "@/lib/api/events";
import { CreateEventDialog } from "@/components/admin/CreateEventDialog";
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

function AdminPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [eventRows, setEventRows] = useState<CollegeEvent[]>(fallbackEvents);
  const [listError, setListError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    try {
      const list = await fetchEvents({ includeAllStatuses: true, page: 0, size: 200 });
      setEventRows(list.length ? list : fallbackEvents);
      setListError(null);
    } catch {
      setListError("Showing cached sample data — API could not be reached.");
      setEventRows(fallbackEvents);
    }
  }, []);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  return (
    <RequireAdmin>
    <section className="py-10 bg-secondary/30 min-h-screen">
      <div className="container-page">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-1">Admin Console</p>
            <h1 className="font-display text-3xl md:text-4xl font-bold">Events & Operations</h1>
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

        <CreateEventDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={() => void loadEvents()} />

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Calendar, label: "Active Events", value: "32", change: "+4 this week" },
            { icon: Users, label: "Total Registrations", value: "8,247", change: "+512 this week" },
            { icon: TrendingUp, label: "Attendance Rate", value: "87%", change: "+3% vs last month" },
            { icon: Clock, label: "Pending Approvals", value: "9", change: "5 collaboration" },
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

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold">Registrations — Last 7 days</h2>
              <span className="text-xs text-muted-foreground">vs previous period</span>
            </div>
            <div className="h-56 flex items-end gap-3">
              {[40, 65, 50, 80, 95, 70, 110].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-gradient-to-t from-primary to-gold rounded-t-md transition-all hover:opacity-80"
                    style={{ height: `${h}%` }}
                  />
                  <span className="text-[10px] text-muted-foreground font-medium">D{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold mb-5">By Category</h2>
            <div className="space-y-3">
              {[
                { c: "Hackathon", p: 28, color: "bg-primary" },
                { c: "Cultural", p: 22, color: "bg-[oklch(0.65_0.18_320)]" },
                { c: "Workshop", p: 18, color: "bg-[oklch(0.65_0.16_240)]" },
                { c: "Sports", p: 16, color: "bg-success" },
                { c: "Seminar", p: 16, color: "bg-gold" },
              ].map((r) => (
                <div key={r.c}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">{r.c}</span>
                    <span className="text-muted-foreground">{r.p}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${r.color}`} style={{ width: `${r.p * 2}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 mb-8">
          <h2 className="font-display text-xl font-bold mb-5">Pending Approvals</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-2">Event</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Submitted by</th>
                  <th className="py-2">Date</th>
                  <th className="py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { t: "Tech Symposium 2026", type: "Event", by: "Dr. Verma · CSE Dept", date: "May 9" },
                  { t: "Joint Cultural Night with DAVV", type: "Collaboration", by: "DAVV Indore", date: "May 8" },
                  { t: "Inter-college Debate", type: "Event", by: "Liberal Arts Club", date: "May 7" },
                ].map((r, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="py-3 pr-4 font-medium">{r.t}</td>
                    <td className="py-3 pr-4">
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-accent text-accent-foreground">{r.type}</span>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{r.by}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{r.date}</td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-success/15 text-success rounded-md hover:bg-success/25 mr-1"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-destructive/10 text-destructive rounded-md hover:bg-destructive/20"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <h2 className="font-display text-xl font-bold">All Events</h2>
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
                {eventRows.map((e) => {
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
                            <div className="h-full bg-primary" style={{ width: `${(reg / e.seatsTotal) * 100}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded ${statusBadgeClass(e.approvalStatus)}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button type="button" className="p-1.5 hover:bg-secondary rounded">
                          <MoreVertical className="h-4 w-4" />
                        </button>
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
