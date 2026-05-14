import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useEffect, useState } from "react";
import { Loader2, Search, Filter } from "lucide-react";
import { events, categories, EVENT_CATEGORY_IDS, type EventCategory, type CollegeEvent } from "@/lib/events-data";
import { EventCard } from "@/components/site/EventCard";
import { fetchEventsPage } from "@/lib/api/events";

type SearchParams = { category?: EventCategory };

function modeToApi(mode: "All" | "Online" | "Offline" | "Hybrid"): "ONLINE" | "OFFLINE" | "HYBRID" | undefined {
  if (mode === "All") return undefined;
  if (mode === "Online") return "ONLINE";
  if (mode === "Offline") return "OFFLINE";
  return "HYBRID";
}

function applyClientFilter(
  source: CollegeEvent[],
  opts: {
    keyword: string;
    category: EventCategory | "All";
    mode: "All" | "Online" | "Offline" | "Hybrid";
    fee: "All" | "Free" | "Paid";
  },
): CollegeEvent[] {
  const q = opts.keyword.toLowerCase();
  return source.filter((e) => {
    if (opts.category !== "All" && e.category !== opts.category) return false;
    if (opts.mode !== "All" && e.mode !== opts.mode) return false;
    if (opts.fee === "Free" && e.fee !== 0) return false;
    if (opts.fee === "Paid" && e.fee === 0) return false;
    if (q && !`${e.title} ${e.college} ${e.organizer}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

export const Route = createFileRoute("/events/")({
  loader: () => ({ fallback: events }),
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    category: s.category as EventCategory | undefined,
  }),
  head: () => ({
    meta: [
      { title: "All Events — MU Events Portal" },
      { name: "description", content: "Browse all upcoming college events at Mandsaur University and partner institutions." },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const { fallback } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [category, setCategory] = useState<EventCategory | "All">(() => search.category ?? "All");
  const [mode, setMode] = useState<"All" | "Online" | "Offline" | "Hybrid">("All");
  const [fee, setFee] = useState<"All" | "Free" | "Paid">("All");

  const [list, setList] = useState<CollegeEvent[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedKeyword(query.trim()), 350);
    return () => window.clearTimeout(id);
  }, [query]);

  useEffect(() => {
    setCategory(search.category ?? "All");
  }, [search.category]);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    setUsedFallback(false);

    const categoryId = category === "All" ? undefined : EVENT_CATEGORY_IDS[category];
    const modeParam = modeToApi(mode);
    const freeOnly = fee === "Free" ? true : undefined;
    const paidOnly = fee === "Paid" ? true : undefined;
    const keyword = debouncedKeyword || undefined;

    (async () => {
      try {
        const { events: rows, totalElements: total } = await fetchEventsPage({
          keyword,
          categoryId,
          mode: modeParam,
          freeOnly,
          paidOnly,
          page: 0,
          size: 200,
          signal: ac.signal,
        });
        if (ac.signal.aborted) return;
        setList(rows);
        setTotalElements(total);
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        const filtered = applyClientFilter(fallback, {
          keyword: debouncedKeyword,
          category,
          mode,
          fee,
        });
        if (ac.signal.aborted) return;
        setList(filtered);
        setTotalElements(filtered.length);
        setUsedFallback(true);
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [debouncedKeyword, category, mode, fee, fallback]);

  function resetFilters() {
    setQuery("");
    setDebouncedKeyword("");
    setMode("All");
    setFee("All");
    setCategory("All");
    void navigate({ to: "/events/", search: {} });
  }

  const countLabel =
    usedFallback || totalElements <= list.length
      ? `${list.length} event${list.length === 1 ? "" : "s"}`
      : `${list.length} of ${totalElements} events`;

  return (
    <RequireAuth>
      <section className="bg-ink text-ink-foreground py-14">
        <div className="container-page">
          <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">Discover</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">All Events</h1>
          <p className="opacity-80 max-w-2xl">Filter, search and find the perfect event from across MU and our partner colleges.</p>
        </div>
      </section>

      <section className="py-10">
        <div className="container-page">
          <div className="bg-card border border-border rounded-xl p-4 shadow-card mb-8">
            <div className="grid md:grid-cols-[1fr_auto_auto_auto] gap-3">
              <div className="flex items-center gap-2 px-3 border border-input rounded-lg">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search events…"
                  className="flex-1 py-2.5 bg-transparent outline-none text-sm"
                />
              </div>
              <select
                value={category}
                onChange={(e) => {
                  const v = e.target.value as EventCategory | "All";
                  setCategory(v);
                  void navigate({
                    to: "/events/",
                    search: (prev) => ({
                      ...prev,
                      category: v === "All" ? undefined : v,
                    }),
                    replace: true,
                  });
                }}
                className="px-3 py-2.5 border border-input rounded-lg text-sm bg-card"
              >
                <option>All</option>
                {categories.map((c) => (
                  <option key={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as "All" | "Online" | "Offline" | "Hybrid")}
                className="px-3 py-2.5 border border-input rounded-lg text-sm bg-card"
              >
                <option>All</option>
                <option>Online</option>
                <option>Offline</option>
                <option>Hybrid</option>
              </select>
              <select
                value={fee}
                onChange={(e) => setFee(e.target.value as "All" | "Free" | "Paid")}
                className="px-3 py-2.5 border border-input rounded-lg text-sm bg-card"
              >
                <option>All</option>
                <option>Free</option>
                <option>Paid</option>
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 shrink-0" />
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                    Loading…
                  </>
                ) : (
                  <>Showing {countLabel}</>
                )}
              </span>
              {usedFallback ? <span className="text-amber-700 dark:text-amber-500">Sample list (API unavailable).</span> : null}
            </div>
          </div>

          {loading && list.length === 0 ? (
            <div className="flex justify-center py-20 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" aria-label="Loading events" />
            </div>
          ) : !loading && list.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p>No events match your filters.</p>
              <button type="button" onClick={resetFilters} className="text-primary font-semibold mt-2 inline-block bg-transparent border-0 cursor-pointer p-0">
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {list.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          )}
        </div>
      </section>
    </RequireAuth>
  );
}