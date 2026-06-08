import { createFileRoute, Link } from "@tanstack/react-router";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Calendar, MapPin, Users, Clock, Building2, IndianRupee, ArrowRight, CheckCircle2, Share2 } from "lucide-react";
import type { CollegeEvent } from "@/lib/events-data";
import { EventCard } from "@/components/site/EventCard";
import { fetchEventById, fetchEvents } from "@/lib/api/events";
import { formatCalendarDateMedium, formatCalendarDayMonth } from "@/lib/format-calendar-date";

export const Route = createFileRoute("/events/$eventId/")({
  loader: async ({ params }) => {
    const event = await fetchEventById(params.eventId);
    const allEvents = await fetchEvents({ page: 0, size: 80 }).catch(() => [] as CollegeEvent[]);
    return { event, allEvents };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.event.title} — MU Events` },
      { name: "description", content: loaderData.event.description },
      { property: "og:title", content: loaderData.event.title },
      { property: "og:description", content: loaderData.event.description },
      { property: "og:image", content: loaderData.event.image },
    ] : [],
  }),
  component: EventDetail,
  notFoundComponent: () => (
    <div className="container-page py-32 text-center">
      <h1 className="font-display text-4xl mb-3">Event not found</h1>
      <Link to="/events" className="text-primary font-semibold">← Back to all events</Link>
    </div>
  ),
});

function EventDetail() {
  const { event, allEvents } = Route.useLoaderData() as { event: CollegeEvent; allEvents: CollegeEvent[] };
  const related = allEvents.filter(e => e.id !== event.id && e.category === event.category).slice(0, 3);
  const seatPct = (event.seatsLeft / event.seatsTotal) * 100;

  return (
    <RequireAuth>
      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0">
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/40" />
        </div>
        <div className="relative container-page py-20 text-ink-foreground">
          <Link to="/events" className="text-sm opacity-80 hover:opacity-100 mb-6 inline-block">← All events</Link>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-md bg-primary text-primary-foreground">{event.category}</span>
            {event.isPartner && <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-md bg-white/15 backdrop-blur">Partner College</span>}
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-md bg-white/15 backdrop-blur">{event.mode}</span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight mb-4 max-w-4xl">{event.title}</h1>
          <p className="text-base opacity-80">{event.college} · Organized by {event.organizer}</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container-page grid lg:grid-cols-[1fr_380px] gap-10">
          {/* Main */}
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                { icon: Calendar, label: "Date", value: formatCalendarDateMedium(event.date) },
                { icon: Clock, label: "Time", value: event.time },
                { icon: MapPin, label: "Venue", value: event.venue },
                { icon: Users, label: "Capacity", value: `${event.seatsTotal} seats` },
              ].map((m, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-4">
                  <m.icon className="h-5 w-5 text-primary mb-2" />
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{m.label}</div>
                  <div className="text-sm font-semibold mt-0.5">{m.value}</div>
                </div>
              ))}
            </div>

            <h2 className="font-display text-2xl font-bold mb-3">About this event</h2>
            <p className="text-foreground/80 leading-relaxed mb-8">{event.description}</p>

            <h3 className="font-display text-xl font-bold mb-4">Highlights</h3>
            <ul className="space-y-2.5 mb-10">
              {event.highlights.map((h: string, i: number) => (
                <li key={i} className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" /><span>{h}</span></li>
              ))}
            </ul>

            <div className="bg-secondary/40 border border-border rounded-xl p-6">
              <h3 className="font-display text-xl font-bold mb-3 flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /> Organizer</h3>
              <p className="font-semibold">{event.organizer}</p>
              <p className="text-sm text-muted-foreground">{event.college}</p>
            </div>
          </div>

          {/* Sticky booking */}
          <aside>
            <div className="sticky top-32 bg-card border border-border rounded-2xl shadow-elegant overflow-hidden">
              <div className="bg-gradient-to-br from-primary to-[oklch(0.50_0.18_35)] text-primary-foreground p-6">
                <div className="flex items-center gap-1 mb-1 opacity-90">
                  <IndianRupee className="h-5 w-5" /> <span className="text-sm">Registration fee</span>
                </div>
                <div className="font-display text-4xl font-bold">{event.fee === 0 ? "Free" : `₹${event.fee}`}</div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Seats remaining</span>
                    <span className="font-semibold text-primary">{event.seatsLeft} / {event.seatsTotal}</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-gold" style={{ width: `${100 - seatPct}%` }} />
                  </div>
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">Registration closes</span><span className="font-semibold">{formatCalendarDayMonth(event.deadline)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Mode</span><span className="font-semibold">{event.mode}</span></div>
                </div>
                <Link to="/events/$eventId/register" params={{ eventId: event.id }} className="w-full bg-primary text-primary-foreground py-3.5 rounded-lg font-bold hover:opacity-90 transition flex items-center justify-center gap-2">
                  Register Now <ArrowRight className="h-4 w-4" />
                </Link>
                <button className="w-full border border-input py-3 rounded-lg font-semibold text-sm hover:bg-secondary transition flex items-center justify-center gap-2">
                  <Share2 className="h-4 w-4" /> Share event
                </button>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-16 bg-secondary/30">
          <div className="container-page">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-8">Similar events</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map(e => <EventCard key={e.id} event={e} />)}
            </div>
          </div>
        </section>
      )}
    </RequireAuth>
  );
}
