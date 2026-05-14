import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Calendar, Users, Trophy, Sparkles, Search, GraduationCap, Quote, CheckCircle2, X } from "lucide-react";
import heroImg from "@/assets/hero-events.jpg";
import { events, categories, partnerColleges, collaborationOffers, testimonials, type CollegeEvent } from "@/lib/events-data";
import { EventCard } from "@/components/site/EventCard";
import { fetchFeaturedEvents, fetchUpcomingEvents } from "@/lib/api/events";
import { fetchCollaborationOffers, fetchPartnerColleges, fetchTestimonials } from "@/lib/api/public-content";
import { formatCalendarDateMedium } from "@/lib/format-calendar-date";
import { fetchGallery } from "@/lib/api/gallery";

export const Route = createFileRoute("/")({
  loader: async () => {
    try {
      const [apiFeatured, apiUpcoming, apiPartners, apiOffers, apiTestimonials, apiGallery] = await Promise.all([
        fetchFeaturedEvents({ page: 0, size: 12 }).catch(() => [] as CollegeEvent[]),
        fetchUpcomingEvents({ page: 0, size: 12 }).catch(() => [] as CollegeEvent[]),
        fetchPartnerColleges().catch(() => partnerColleges.map((p, i) => ({ id: i + 1, name: p.name, code: p.name, activeOffers: p.offers }))),
        fetchCollaborationOffers().catch(() => collaborationOffers.map((o, i) => ({ collaborationId: i + 1, college: o.college, offer: o.offer, validity: o.validity }))),
        fetchTestimonials().catch(() => testimonials.map((t, i) => ({ id: i + 1, name: t.name, role: t.role, quote: t.quote }))),
        fetchGallery({ size: 24 }).catch(() => []),
      ]);
      let featured = apiFeatured;
      let upcoming = apiUpcoming;
      if (featured.length === 0) {
        featured = events.filter((e) => e.featured);
      }
      if (upcoming.length === 0) {
        upcoming = [...events].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);
      }
      return { featured, upcoming, partners: apiPartners, offers: apiOffers, testimonials: apiTestimonials, gallery: apiGallery };
    } catch {
      return {
        featured: events.filter((e) => e.featured),
        upcoming: [...events].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6),
        partners: partnerColleges.map((p, i) => ({ id: i + 1, name: p.name, code: p.name, activeOffers: p.offers })),
        offers: collaborationOffers.map((o, i) => ({ collaborationId: i + 1, college: o.college, offer: o.offer, validity: o.validity })),
        testimonials: testimonials.map((t, i) => ({ id: i + 1, name: t.name, role: t.role, quote: t.quote })),
        gallery: [],
      };
    }
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
  const { featured, upcoming, partners, offers, testimonials: voices, gallery } = Route.useLoaderData();
  const [galleryCategory, setGalleryCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<null | typeof gallery[number]>(null);
  const categoryItems = useMemo(() => {
    const all = Array.from(new Set(gallery.map(g => g.category).filter(Boolean)));
    return ["All", ...all];
  }, [gallery]);
  const filteredGallery = useMemo(
    () => gallery.filter(g => galleryCategory === "All" || g.category === galleryCategory),
    [gallery, galleryCategory],
  );

  const categoryLabels = useMemo(() => {
    const fromEvents = Array.from(new Set([...featured.map((e) => e.category), ...upcoming.map((e) => e.category)]));
    return fromEvents.length > 0 ? fromEvents : categories;
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
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
            {categoryLabels.map(c => (
              <Link key={c} to="/events" search={{ category: c }} className="bg-card border border-border hover:border-primary hover:bg-primary/5 transition rounded-lg px-3 py-4 text-center text-xs font-semibold">
                {c}
              </Link>
            ))}
          </div>
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map(e => <EventCard key={e.id} event={e} />)}
          </div>
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcoming.map(e => <EventCard key={e.id} event={e} />)}
          </div>
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

      {/* Event Gallery */}
      <section className="py-20 bg-secondary/30 border-y border-border">
        <div className="container-page">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">Campus Gallery</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Event Memories & Campus Highlights</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore the success stories and memorable moments from our past events.
            </p>
          </div>

          {gallery.length > 0 ? (
            <>
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {categoryItems.map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setGalleryCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold border transition ${
                      galleryCategory === cat
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border hover:border-primary hover:text-primary"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredGallery.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setSelectedImage(item)}
                    className="text-left group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-elegant hover:border-primary/40 transition"
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
                    </div>
                    <div className="p-5">
                      <div className="text-[10px] uppercase tracking-widest text-primary font-semibold mb-2">{item.category} · {formatCalendarDateMedium(item.eventDate)}</div>
                      <h3 className="font-display text-lg font-bold mb-1 line-clamp-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.description || item.eventTitle || "Campus highlight from our university ecosystem."}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-2xl bg-card/50">
              Gallery will appear here once admins upload event media.
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container-page">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">Voices from campus</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold">What students say</h2>
          </div>
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

      {selectedImage ? (
        <div
          className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="max-w-5xl w-full bg-card border border-border rounded-2xl overflow-hidden">
            <div className="relative aspect-[16/9] bg-black">
              <img src={selectedImage.imageUrl} alt={selectedImage.title} className="w-full h-full object-contain" />
              <button type="button" className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-2" onClick={() => setSelectedImage(null)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">
                {selectedImage.category} · {formatCalendarDateMedium(selectedImage.eventDate)}
              </p>
              <h3 className="font-display text-2xl font-bold mb-2">{selectedImage.title}</h3>
              <p className="text-muted-foreground">{selectedImage.description || selectedImage.eventTitle || "University event moment."}</p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
