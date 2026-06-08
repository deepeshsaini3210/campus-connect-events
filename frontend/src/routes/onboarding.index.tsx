import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RequireOnboarding } from "@/components/auth/RequireOnboarding";
import { fetchTodayOnboardingEvents, type OnboardingEvent } from "@/lib/api/onboarding";
import { formatCalendarDateMedium } from "@/lib/format-calendar-date";
import { Calendar, Users, MapPin, Loader2, ScanLine } from "lucide-react";

export const Route = createFileRoute("/onboarding/")({
  head: () => ({ meta: [{ title: "Onboarding — MU Events" }] }),
  component: OnboardingHomePage,
});

function OnboardingHomePage() {
  const [events, setEvents] = useState<OnboardingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const list = await fetchTodayOnboardingEvents();
        setEvents(list);
        setError(null);
      } catch (e) {
        setEvents([]);
        setError(e instanceof Error ? e.message : "Could not load events");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const todayLabel = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <RequireOnboarding>
      <section className="py-10 bg-secondary/30 min-h-screen">
        <div className="container-page">
          <div className="flex items-center gap-3 mb-2">
            <ScanLine className="h-8 w-8 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-widest text-primary font-semibold">Venue check-in</p>
              <h1 className="font-display text-3xl font-bold">Onboarding</h1>
            </div>
          </div>
          <p className="text-muted-foreground mb-8">Events scheduled for today — {todayLabel}</p>

          {error ? <p className="text-sm text-destructive mb-6">{error}</p> : null}

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            </div>
          ) : events.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
              No approved events scheduled for today.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {events.map((e) => (
                <Link
                  key={e.id}
                  to="/onboarding/$eventId"
                  params={{ eventId: String(e.id) }}
                  className="bg-card border border-border rounded-2xl p-6 hover:border-primary hover:shadow-elegant transition block"
                >
                  <p className="text-[10px] uppercase tracking-widest text-primary font-semibold mb-2">{e.category}</p>
                  <h2 className="font-display text-xl font-bold mb-3 line-clamp-2">{e.title}</h2>
                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      {formatCalendarDateMedium(e.eventDate)} · {e.eventTime?.slice(0, 5)}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="line-clamp-1">{e.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 font-semibold text-foreground pt-2">
                      <Users className="h-3.5 w-3.5 text-primary" />
                      {e.registrantCount} paid registrations
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </RequireOnboarding>
  );
}
