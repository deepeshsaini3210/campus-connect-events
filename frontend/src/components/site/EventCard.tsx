import { Link } from "@tanstack/react-router";
import { Calendar, MapPin, Users } from "lucide-react";
import type { CollegeEvent } from "@/lib/events-data";
import { formatCalendarDateLong } from "@/lib/format-calendar-date";

const categoryColor: Record<string, string> = {
  Technical: "bg-primary/10 text-primary border-primary/30",
  Cultural: "bg-[oklch(0.95_0.06_350)] text-[oklch(0.45_0.20_350)] border-[oklch(0.85_0.10_350)]",
  Sports: "bg-[oklch(0.94_0.08_150)] text-[oklch(0.40_0.15_150)] border-[oklch(0.80_0.12_150)]",
  Workshop: "bg-[oklch(0.94_0.06_240)] text-[oklch(0.40_0.18_240)] border-[oklch(0.82_0.10_240)]",
  Seminar: "bg-accent text-accent-foreground border-border",
  Hackathon: "bg-gradient-to-r from-primary to-gold text-primary-foreground border-transparent",
  Fest: "bg-[oklch(0.94_0.10_320)] text-[oklch(0.40_0.20_320)] border-[oklch(0.80_0.12_320)]",
  Placement: "bg-[oklch(0.94_0.08_180)] text-[oklch(0.35_0.15_180)] border-[oklch(0.80_0.12_180)]",
  Competition: "bg-secondary text-secondary-foreground border-border",
};

export function EventCard({ event }: { event: CollegeEvent }) {
  const seatPct = (event.seatsLeft / event.seatsTotal) * 100;
  return (
    <Link
      to="/events/$eventId"
      params={{ eventId: event.id }}
      className="group block bg-card rounded-xl overflow-hidden border border-border shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img src={event.image} alt={event.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-md border ${categoryColor[event.category]}`}>
            {event.category}
          </span>
          {event.isPartner && (
            <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-ink/85 text-ink-foreground backdrop-blur">
              Partner
            </span>
          )}
        </div>
        {event.fee === 0 && (
          <span className="absolute top-3 right-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-success text-white">Free</span>
        )}
      </div>
      <div className="p-5">
        <p className="text-xs text-muted-foreground font-medium mb-1.5">{event.college} · {event.organizer}</p>
        <h3 className="font-display text-lg font-bold leading-snug mb-3 group-hover:text-primary transition-colors line-clamp-2">{event.title}</h3>
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-primary" /> {formatCalendarDateLong(event.date)} · {event.time}</div>
          <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-primary" /> {event.venue} · {event.mode}</div>
          <div className="flex items-center gap-2"><Users className="h-3.5 w-3.5 text-primary" /> {event.seatsLeft} of {event.seatsTotal} seats left</div>
        </div>
        <div className="mt-3 h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-gold" style={{ width: `${100 - seatPct}%` }} />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-bold text-foreground">{event.fee === 0 ? "Free" : `₹${event.fee}`}</span>
          <span className="text-sm font-semibold text-primary group-hover:underline">View details →</span>
        </div>
      </div>
    </Link>
  );
}
