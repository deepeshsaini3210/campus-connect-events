import { createFileRoute, Link } from "@tanstack/react-router";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { events as staticEvents, type CollegeEvent } from "@/lib/events-data";
import { fetchUpcomingEvents } from "@/lib/api/events";
import {
  formatCalendarMonthYearHeading,
  getCalendarMonthShort,
  parseCalendarYmd,
} from "@/lib/format-calendar-date";

const DEFAULT_CALENDAR_VIEW = { y: 2026, m: 5 };

function earliestEventMonth(list: CollegeEvent[]): { y: number; m: number } | null {
  let best: { y: number; m: number } | null = null;
  for (const e of list) {
    const p = parseCalendarYmd(e.date);
    if (!p) continue;
    if (!best || p.y * 100 + p.m < best.y * 100 + best.m) best = { y: p.y, m: p.m };
  }
  return best;
}

function addCalendarMonths(y: number, m: number, delta: number): { y: number; m: number } {
  let nm = m + delta;
  let ny = y;
  while (nm > 12) {
    nm -= 12;
    ny += 1;
  }
  while (nm < 1) {
    nm += 12;
    ny -= 1;
  }
  return { y: ny, m: nm };
}

function daysInMonthUtc(year: number, month1to12: number): number {
  return new Date(Date.UTC(year, month1to12, 0)).getUTCDate();
}

/** 0 = Sunday … 6 = Saturday (matches JS getUTCDay). */
function startWeekdaySundayFirstUtc(year: number, month1to12: number): number {
  return new Date(Date.UTC(year, month1to12 - 1, 1)).getUTCDay();
}

export const Route = createFileRoute("/calendar")({
  loader: async () => {
    try {
      const list = await fetchUpcomingEvents({ page: 0, size: 500 });
      const defaultView = earliestEventMonth(list) ?? DEFAULT_CALENDAR_VIEW;
      return { events: list, defaultView, usedFallback: false };
    } catch {
      const list = staticEvents;
      return {
        events: list,
        defaultView: earliestEventMonth(list) ?? DEFAULT_CALENDAR_VIEW,
        usedFallback: true,
      };
    }
  },
  head: () => ({
    meta: [
      { title: "Event Calendar — MU Events" },
      { name: "description", content: "Visualize all upcoming MU events on a monthly calendar." },
    ],
  }),
  component: CalendarPage,
});

function CalendarPage() {
  const { events: loadedEvents, defaultView, usedFallback } = Route.useLoaderData();
  const [view, setView] = useState(defaultView);

  useEffect(() => {
    setView(defaultView);
  }, [defaultView.y, defaultView.m]);

  const { y: year, m: month } = view;
  const firstDay = startWeekdaySundayFirstUtc(year, month);
  const daysInMonth = daysInMonthUtc(year, month);
  const cells: (number | null)[] = useMemo(() => {
    const row: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
    while (row.length % 7 !== 0) row.push(null);
    return row;
  }, [firstDay, daysInMonth]);

  const eventsByDay = useMemo(() => {
    const map: Record<number, CollegeEvent[]> = {};
    for (const e of loadedEvents) {
      const d = parseCalendarYmd(e.date);
      if (!d || d.y !== year || d.m !== month) continue;
      (map[d.d] ??= []).push(e);
    }
    return map;
  }, [loadedEvents, year, month]);

  const eventsThisMonth = useMemo(
    () =>
      loadedEvents.filter((e) => {
        const d = parseCalendarYmd(e.date);
        return d !== null && d.y === year && d.m === month;
      }),
    [loadedEvents, year, month],
  );

  return (
    <RequireAuth>
      <section className="bg-ink text-ink-foreground py-14">
        <div className="container-page">
          <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">Plan your month</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">Event Calendar</h1>
          <p className="opacity-80">
            {formatCalendarMonthYearHeading(year, month)} · Mandsaur University & Partner Colleges
          </p>
          {usedFallback ? (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">Showing sample events — API unavailable.</p>
          ) : null}
        </div>
      </section>

      <section className="py-12">
        <div className="container-page">
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              type="button"
              onClick={() => setView((v) => addCalendarMonths(v.y, v.m, -1))}
              className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-border bg-card hover:bg-secondary transition"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="font-display text-lg font-semibold min-w-[12rem] text-center">
              {formatCalendarMonthYearHeading(year, month)}
            </span>
            <button
              type="button"
              onClick={() => setView((v) => addCalendarMonths(v.y, v.m, 1))}
              className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-border bg-card hover:bg-secondary transition"
              aria-label="Next month"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
            <div className="grid grid-cols-7 bg-secondary border-b border-border">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="p-3 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {cells.map((day, i) => {
                const dayEvents = day ? (eventsByDay[day] ?? []) : [];
                return (
                  <div
                    key={i}
                    className="min-h-28 border-r border-b border-border p-2 last:border-r-0 hover:bg-secondary/30 transition"
                  >
                    {day ? (
                      <>
                        <div className="text-xs font-semibold text-muted-foreground mb-1">{day}</div>
                        <div className="space-y-1">
                          {dayEvents.map((e) => (
                            <Link
                              key={e.id}
                              to="/events/$eventId"
                              params={{ eventId: e.id }}
                              className="block text-[10px] bg-primary/10 text-primary border-l-2 border-primary px-1.5 py-1 rounded truncate font-medium hover:bg-primary/20"
                            >
                              {e.title}
                            </Link>
                          ))}
                        </div>
                      </>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="font-display text-xl font-bold mb-4">Events this month</h2>
            {eventsThisMonth.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming events in this month.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {eventsThisMonth.map((e) => (
                  <Link
                    key={e.id}
                    to="/events/$eventId"
                    params={{ eventId: e.id }}
                    className="flex items-center gap-4 bg-card border border-border rounded-lg p-4 hover:border-primary transition"
                  >
                    <div className="text-center px-3 py-2 bg-primary/10 rounded-lg shrink-0">
                      {(() => {
                        const p = parseCalendarYmd(e.date);
                        if (!p) return <span className="text-xs text-muted-foreground">—</span>;
                        return (
                          <>
                            <div className="text-[10px] uppercase tracking-wider text-primary font-bold">
                              {getCalendarMonthShort(p.m)}
                            </div>
                            <div className="font-display text-2xl font-bold text-primary leading-none">{p.d}</div>
                          </>
                        );
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{e.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {e.venue} · {e.time}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </RequireAuth>
  );
}
