import { createFileRoute, Link } from "@tanstack/react-router";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useEffect, useMemo, useState } from "react";
import { Calendar, Ticket, Award, TrendingUp, Bell, Download, MapPin, Loader2 } from "lucide-react";
import { EVENT_IMAGES } from "@/lib/events-data";
import { formatCalendarDateMedium, formatCalendarDayMonth, parseCalendarYmd } from "@/lib/format-calendar-date";
import { fetchMyBookings, fetchMyNotifications, type BookingItem, type NotificationItem } from "@/lib/api/dashboard";
import { fetchBookingById } from "@/lib/api/bookings";
import { downloadEventTicket } from "@/lib/ticket-download";
import { resolveEventImageUrl } from "@/lib/api/events";
import { authService } from "@/lib/api/auth";
import { canAccessStudentDashboard } from "@/lib/auth/roles";
import { postLoginPath } from "@/lib/auth/nav";
import { useNavigate } from "@tanstack/react-router";
import { useLayoutEffect } from "react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Student Dashboard — MU Events" }] }),
  component: DashboardPage,
});

function isPastEventDate(isoDate: string): boolean {
  const p = parseCalendarYmd(isoDate);
  if (!p) return false;
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  if (p.y !== y) return p.y < y;
  if (p.m !== m) return p.m < m;
  return p.d < d;
}

function bookingEventImage(b: BookingItem): string {
  const resolved = resolveEventImageUrl(b.event.imageUrl);
  if (resolved) return resolved;
  return EVENT_IMAGES.tech;
}

function shortAgo(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  const diff = Date.now() - t;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

function statusBadgeClass(status: string): string {
  const s = status.toUpperCase();
  if (s === "ATTENDED") return "bg-success/15 text-success";
  if (s === "CONFIRMED") return "bg-primary/15 text-primary";
  if (s === "PENDING") return "bg-amber-500/15 text-amber-700 dark:text-amber-400";
  if (s === "CANCELLED") return "bg-muted text-muted-foreground";
  return "bg-secondary text-secondary-foreground";
}

function DashboardPage() {
  const navigate = useNavigate();

  useLayoutEffect(() => {
    const role = authService.getCurrentUser()?.role;
    if (!canAccessStudentDashboard(role)) {
      navigate({ to: postLoginPath(role) });
    }
  }, [navigate]);

  const user = authService.getCurrentUser();
  const canViewBookings = authService.isAuthenticated();

  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const notes = await fetchMyNotifications();
        if (!cancelled) setNotifications(notes);
      } catch {
        if (!cancelled) setNotifications([]);
      }
      if (!canViewBookings) {
        if (!cancelled) setBookings([]);
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        const b = await fetchMyBookings();
        if (!cancelled) setBookings(b);
      } catch (e) {
        if (!cancelled) {
          setBookings([]);
          setLoadError(e instanceof Error ? e.message : "Could not load bookings");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [canViewBookings]);

  const { upcomingBookings, historyBookings, stats } = useMemo(() => {
    const upcoming = bookings
      .filter((b) => b.status !== "CANCELLED" && !isPastEventDate(b.event.eventDate))
      .sort((a, b) => a.event.eventDate.localeCompare(b.event.eventDate));
    const history = bookings
      .filter((b) => isPastEventDate(b.event.eventDate) || b.status === "ATTENDED" || b.status === "CANCELLED")
      .sort((a, b) => b.event.eventDate.localeCompare(a.event.eventDate));
    const attended = bookings.filter((b) => b.status === "ATTENDED").length;
    const unread = notifications.filter((n) => !n.isRead).length;
    return {
      upcomingBookings: upcoming.slice(0, 8),
      historyBookings: history.slice(0, 12),
      stats: {
        upcomingCount: upcoming.length,
        attended,
        unread,
        total: bookings.length,
      },
    };
  }, [bookings, notifications]);

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || "Student";
  const subtitleParts = [user?.college?.name, user?.role ? user.role.replace(/_/g, " ") : ""].filter(Boolean);

  return (
    <RequireAuth>
      <section className="py-10 bg-secondary/30 min-h-screen">
        <div className="container-page">
          <div className="bg-gradient-to-br from-ink to-[oklch(0.25_0.05_35)] text-ink-foreground rounded-2xl p-7 md:p-10 mb-8 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary/30 blur-3xl" />
            <div className="relative">
              <p className="text-xs uppercase tracking-widest text-gold font-semibold mb-2">Welcome back</p>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Hello, {displayName} 👋</h1>
              <p className="opacity-80 text-sm">{subtitleParts.join(" · ") || "MU Events account"}</p>
            </div>
          </div>

          {loadError ? (
            <p className="text-sm text-destructive mb-6" role="alert">
              {loadError}
            </p>
          ) : null}
          {!canViewBookings ? (
            <p className="text-sm text-muted-foreground mb-6">
              Sign in to see events you registered for.
            </p>
          ) : null}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Ticket, label: "Upcoming bookings", value: String(stats.upcomingCount), color: "text-primary" },
              { icon: Calendar, label: "Events attended", value: String(stats.attended), color: "text-success" },
              { icon: Bell, label: "Unread notifications", value: String(stats.unread), color: "text-gold" },
              { icon: TrendingUp, label: "Total bookings", value: String(stats.total), color: "text-primary" },
            ].map((s) => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-5">
                <s.icon className={`h-6 w-6 mb-3 ${s.color}`} />
                <div className="font-display text-3xl font-bold">{loading ? "—" : s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-[1fr_320px] gap-6">
            <div className="space-y-8">
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display text-xl font-bold">My registered events</h2>
                  <Link to="/events" className="text-xs text-primary font-semibold hover:underline">
                    Browse events →
                  </Link>
                </div>
                {loading ? (
                  <div className="flex justify-center py-12 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" aria-label="Loading" />
                  </div>
                ) : !canViewBookings ? (
                  <p className="text-sm text-muted-foreground py-4">Sign in to see your event registrations.</p>
                ) : upcomingBookings.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">No upcoming registrations. Explore events and book your spot.</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingBookings.map((b) => (
                      <div key={b.id} className="flex items-center gap-4 p-3 border border-border rounded-lg hover:border-primary transition">
                        <img src={bookingEventImage(b)} alt="" className="h-16 w-16 rounded-lg object-cover shrink-0" loading="lazy" />
                        <div className="flex-1 min-w-0">
                          <Link
                            to="/events/$eventId"
                            params={{ eventId: String(b.event.id) }}
                            className="font-semibold text-sm hover:text-primary block truncate"
                          >
                            {b.event.title}
                          </Link>
                          <div className="text-xs text-muted-foreground flex items-center gap-3 mt-1 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 shrink-0" />
                              {formatCalendarDayMonth(b.event.eventDate)}
                            </span>
                            <span className="flex items-center gap-1 min-w-0">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="truncate">{b.event.venue}</span>
                            </span>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{b.status}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="p-2 hover:bg-secondary rounded-md shrink-0 disabled:opacity-40"
                          title="Download ticket with QR"
                          disabled={b.status === "CANCELLED"}
                          onClick={() => {
                            void (async () => {
                              try {
                                const ticket = b.qrCodeImage ? b : await fetchBookingById(b.id);
                                downloadEventTicket(
                                  {
                                    id: ticket.id,
                                    bookingReference: ticket.bookingReference,
                                    rollNumber: ticket.rollNumber ?? user?.rollNumber,
                                    qrCodeImage: ticket.qrCodeImage,
                                    status: ticket.status,
                                    paymentStatus: ticket.paymentStatus,
                                    event: ticket.event,
                                  },
                                  displayName,
                                  ticket.rollNumber ?? user?.rollNumber,
                                );
                              } catch {
                                /* ignore */
                              }
                            })();
                          }}
                        >
                          <Download className="h-4 w-4 text-primary" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-display text-xl font-bold mb-5">Booking history</h2>
                {loading && canViewBookings ? (
                  <div className="flex justify-center py-8 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
                  </div>
                ) : !canViewBookings ? null : historyBookings.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No past bookings yet.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="py-2">Event</th>
                        <th className="py-2">Date</th>
                        <th className="py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyBookings.map((b) => (
                        <tr key={b.id} className="border-b border-border last:border-0">
                          <td className="py-3 pr-4">
                            <div className="font-medium">{b.event.title}</div>
                            <div className="text-xs text-muted-foreground">{b.event.collegeName}</div>
                          </td>
                          <td className="py-3 pr-4 text-xs text-muted-foreground whitespace-nowrap">
                            {formatCalendarDateMedium(b.event.eventDate)}
                          </td>
                          <td className="py-3">
                            <span
                              className={`inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded ${statusBadgeClass(b.status)}`}
                            >
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <aside className="space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" /> Notifications
                </h3>
                {loading ? (
                  <div className="flex justify-center py-6 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
                  </div>
                ) : notifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No notifications yet.</p>
                ) : (
                  <div className="space-y-3 text-sm">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`flex items-start gap-3 p-3 rounded-lg ${n.isRead ? "bg-secondary/20" : "bg-secondary/40"}`}
                      >
                        <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${n.isRead ? "bg-muted-foreground" : "bg-primary"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="leading-snug font-medium">{n.title}</p>
                          <p className="text-muted-foreground text-xs mt-0.5">{n.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{shortAgo(n.createdAt)} ago</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-br from-primary to-[oklch(0.50_0.18_35)] text-primary-foreground rounded-2xl p-6">
                <Award className="h-7 w-7 mb-3" />
                <h3 className="font-display text-lg font-bold mb-1">Progress</h3>
                <p className="text-xs opacity-90 mb-4">
                  You&apos;ve attended <strong>{stats.attended}</strong> event{stats.attended === 1 ? "" : "s"}. Certificates and rewards will appear here when available.
                </p>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all"
                    style={{ width: `${Math.min(100, stats.attended > 0 ? 25 + stats.attended * 15 : 8)}%` }}
                  />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </RequireAuth>
  );
}
