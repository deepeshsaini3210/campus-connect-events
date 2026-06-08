import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { RequireOnboarding } from "@/components/auth/RequireOnboarding";
import { fetchEventRegistrants, type Registrant } from "@/lib/api/onboarding";
import { ArrowLeft, Search, Loader2, CheckCircle2, UserCheck } from "lucide-react";

export const Route = createFileRoute("/onboarding/$eventId/")({
  component: OnboardingEventPage,
});

function OnboardingEventPage() {
  const { eventId } = Route.useParams();
  const numericId = Number(eventId);
  const [search, setSearch] = useState("");
  const [registrants, setRegistrants] = useState<Registrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (q: string) => {
    if (!Number.isFinite(numericId)) return;
    setLoading(true);
    try {
      const list = await fetchEventRegistrants(numericId, q);
      setRegistrants(list);
      setError(null);
    } catch (e) {
      setRegistrants([]);
      setError(e instanceof Error ? e.message : "Could not load registrants");
    } finally {
      setLoading(false);
    }
  }, [numericId]);

  useEffect(() => {
    const t = setTimeout(() => void load(search), 300);
    return () => clearTimeout(t);
  }, [search, load]);

  return (
    <RequireOnboarding>
      <section className="py-10 bg-secondary/30 min-h-screen">
        <div className="container-page max-w-4xl">
          <Link to="/onboarding" className="text-sm text-primary font-semibold inline-flex items-center gap-1 mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to today&apos;s events
          </Link>

          <h1 className="font-display text-3xl font-bold mb-2">Registered attendees</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Search by name, email, or roll number. Select a person to scan their QR at the gate.
          </p>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search attendee…"
              className="w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-background text-sm outline-none focus:border-primary"
            />
          </div>

          {error ? <p className="text-sm text-destructive mb-4">{error}</p> : null}

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : registrants.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">No paid registrations found.</p>
          ) : (
            <div className="space-y-2">
              {registrants.map((r) => (
                <Link
                  key={r.bookingId}
                  to="/onboarding/$eventId/check-in/$userId"
                  params={{ eventId, userId: String(r.userId) }}
                  className={`flex items-center justify-between gap-4 p-4 rounded-xl border transition ${
                    r.entered
                      ? "bg-success/10 border-success/40 pointer-events-none opacity-70"
                      : "bg-card border-border hover:border-primary"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{r.fullName}</div>
                    <div className="text-xs text-muted-foreground truncate">{r.email}</div>
                    {r.rollNumber ? (
                      <div className="text-xs font-mono mt-1">Roll: {r.rollNumber}</div>
                    ) : null}
                  </div>
                  {r.entered ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-success shrink-0">
                      <CheckCircle2 className="h-4 w-4" /> Entered
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary shrink-0">
                      <UserCheck className="h-4 w-4" /> Check in
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </RequireOnboarding>
  );
}
