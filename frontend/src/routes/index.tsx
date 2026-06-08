import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowRight, Calendar, Users, Trophy, Sparkles, Search, GraduationCap, Quote, CheckCircle2 } from "lucide-react";
import heroImg from "@/assets/hero-events.jpg";
import type { CollegeEvent } from "@/lib/events-data";
import { EventCard } from "@/components/site/EventCard";
import { fetchFeaturedEvents, fetchUpcomingEvents } from "@/lib/api/events";
import { fetchCollaborationOffers, fetchPartnerColleges, fetchTestimonials } from "@/lib/api/public-content";
import { formatCalendarDateMedium } from "@/lib/format-calendar-date";
export const Route = createFileRoute("/")({
  loader: async () => {
    const [featured, upcoming, partners, offers, testimonials] = await Promise.all([
      fetchFeaturedEvents({ page: 0, size: 12 }).catch(() => [] as CollegeEvent[]),
      fetchUpcomingEvents({ page: 0, size: 12 }).catch(() => [] as CollegeEvent[]),
      fetchPartnerColleges().catch(() => []),
      fetchCollaborationOffers().catch(() => []),
      fetchTestimonials().catch(() => []),
    ]);
    return { featured, upcoming, partners, offers, testimonials };
  },
  head: () => ({
    meta: [
      { title: "MU Events — Discover, Book & Collaborate | Mandsaur University" },
      { name: "description", content: "The official Mandsaur University events portal — discover hackathons, fests, workshops and inter-college collaborations." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { featured, upcoming, partners, offers, testimonials: voices } = Route.useLoaderData();

  const categoryLabels = useMemo(() => {
    return Array.from(new Set([...featured.map((e) => e.category), ...upcoming.map((e) => e.category)]));
  }, [featured, upcoming]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden text-ink-foreground">
        <img src={heroImg} alt="Mandsaur University students" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 hero-bg opacity-90" />
        <div className="relative container-page py-20 md:py-28 lg:py-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs uppercase tracking-widest font-medium mb-6">
              <Sparkles className="h-3.5 w-3.5 text-gold" /> University Events Portal · 2026
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6">
              Discover. Book. <span className="text-gradient-primary">Belong.</span>
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-10 max-w-2xl leading-relaxed">
              Every hackathon, fest, seminar and collaboration across Mandsaur University and our partner institutions — in one official portal.
            </p>

            {/* Search bar */}
            <div className="bg-card text-card-foreground rounded-xl shadow-elegant p-2 flex flex-col md:flex-row gap-2 max-w-2xl">
              <div className="flex-1 flex items-center gap-2 px-3">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input placeholder="Search events, categories, colleges…" className="flex-1 bg-transparent py-3 text-sm outline-none" />
              </div>
              <Link to="/events" className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition flex items-center justify-center gap-2">
                Explore Events <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="flex flex-wrap gap-4 mt-8 text-sm">
              <Link to="/collaborate" className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/30 hover:bg-white/10 rounded-lg transition">
                Collaborate With Us <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/dashboard" className="inline-flex items-center gap-2 px-5 py-2.5 hover:bg-white/10 rounded-lg transition">
                My Bookings
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl">
            {[
              { icon: Calendar, value: "240+", label: "Events This Year" },
              { icon: Users, value: "18,000", label: "Students Engaged" },
              { icon: GraduationCap, value: "30+", label: "Partner Colleges" },
              { icon: Trophy, value: "₹25L+", label: "Prizes Awarded" },
            ].map((s) => (
              <div key={s.label} className="border-l-2 border-primary pl-4">
                <s.icon className="h-5 w-5 text-gold mb-2" />
                <div className="font-display text-3xl font-bold">{s.value}</div>
                <div className="text-xs uppercase tracking-wider opacity-70 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-secondary/40 border-y border-border">
        <div className="container-page">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">Browse by category</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold">Find what moves you</h2>
            </div>
            <Link to="/events" className="text-sm font-semibold text-primary hover:underline">View all events →</Link>
          </div>
          {categoryLabels.length === 0 ? (
            <p className="text-sm text-muted-foreground">Categories will appear when events are published.</p>
          ) : (
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
            {categoryLabels.map(c => (
              <Link key={c} to="/events" search={{ category: c }} className="bg-card border border-border hover:border-primary hover:bg-primary/5 transition rounded-lg px-3 py-4 text-center text-xs font-semibold">
                {c}
              </Link>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* Featured */}
      <section className="py-20">
        <div className="container-page">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">Spotlight</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold">Featured Events</h2>
            </div>
          </div>
          {featured.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No featured events in the database yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Upcoming */}
      <section className="py-20 bg-secondary/30">
        <div className="container-page">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">Coming up next</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold">Upcoming Events</h2>
            </div>
            <Link to="/calendar" className="text-sm font-semibold text-primary hover:underline">Calendar view →</Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No upcoming events in the database yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcoming.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Partner colleges */}
      <section className="py-20">
        <div className="container-page">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">Stronger together</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Partner Colleges</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">We collaborate with India's top institutions to bring exclusive opportunities to our students.</p>
          </div>
          {partners.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">No partner colleges yet — submit a collaboration request.</p>
          ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {partners.map(p => (
              <div key={p.name} className="bg-card border border-border rounded-xl p-6 text-center hover:border-primary hover:shadow-card transition">
                <div className="h-14 w-14 mx-auto rounded-full bg-gradient-to-br from-primary to-gold flex items-center justify-center mb-3">
                  <GraduationCap className="h-7 w-7 text-primary-foreground" />
                </div>
                <h4 className="font-semibold text-sm mb-1">{p.name}</h4>
                <p className="text-xs text-muted-foreground">{p.activeOffers} active offers</p>
              </div>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* Collaboration offers */}
      <section className="py-20 bg-ink text-ink-foreground">
        <div className="container-page">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">Exclusive perks</p>
              <h2 className="font-display text-3xl md:text-5xl font-bold mb-6 leading-tight">
                Special Collaboration <span className="text-gradient-primary">Offers</span>
              </h2>
              <p className="opacity-80 mb-8 leading-relaxed">
                As a Mandsaur University student, you unlock exclusive discounts, reserved slots and priority access to events at our partner institutions.
              </p>
              <Link to="/collaborate" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold text-sm hover:opacity-90">
                Explore all offers <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {offers.length === 0 ? (
                <p className="text-sm opacity-70">No approved collaboration offers yet.</p>
              ) : null}
              {offers.map((o) => (
                <div key={o.collaborationId} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-primary/50 transition">
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="h-6 w-6 text-gold shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                        <h4 className="font-semibold">{o.college}</h4>
                        <span className="text-[10px] uppercase tracking-widest opacity-60">{o.validity}</span>
                      </div>
                      <p className="text-sm opacity-80">{o.offer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container-page">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">Voices from campus</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold">What students say</h2>
          </div>
          {voices.length === 0 ? (
            <p className="text-center text-muted-foreground">No testimonials in the database yet.</p>
          ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {voices.map((t) => (
              <div key={t.id} className="bg-card border border-border rounded-2xl p-7 shadow-card">
                <Quote className="h-8 w-8 text-primary/30 mb-4" />
                <p className="text-sm leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-gold flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {t.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary to-[oklch(0.45_0.18_30)] text-primary-foreground">
        <div className="container-page text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">Ready to make this semester unforgettable?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">Join 18,000+ MU students who never miss out.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/events" className="bg-white text-primary px-8 py-4 rounded-lg font-bold hover:opacity-90 inline-flex items-center gap-2">Explore Events <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/collaborate" className="border-2 border-white px-8 py-4 rounded-lg font-bold hover:bg-white/10 inline-flex items-center gap-2">Collaborate With Us</Link>
          </div>
        </div>
      </section>

    </>
  );
}
