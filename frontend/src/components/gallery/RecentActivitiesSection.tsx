import { format, parseISO } from "date-fns";
import { Flame, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { GalleryImage } from "@/lib/api/gallery";
import { resolveGalleryImageUrl } from "@/lib/api/gallery";
import { EVENT_IMAGES } from "@/lib/events-data";
import { cn } from "@/lib/utils";

type Props = {
  items: GalleryImage[];
};

export function RecentActivitiesSection({ items }: Props) {
  return (
    <section className="py-16 md:py-20">
      <div className="container-page">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Recent activities
            </p>
            <h2 className="font-display mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              Latest campus moments
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Featured shots and the freshest additions from our event pipeline — ideal for
              newsletters and social highlights.
            </p>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 self-start rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold shadow-sm transition hover:border-primary/40 hover:bg-accent md:self-auto"
          >
            View all events
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-14 text-center text-muted-foreground">
            Recent highlights will appear once gallery images are published.
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-12 lg:items-stretch">
            <article className="relative overflow-hidden rounded-2xl border border-border bg-ink text-ink-foreground shadow-xl lg:col-span-5">
              {(() => {
                const hero = items[0];
                const src = resolveGalleryImageUrl(hero.imageUrl);
                return (
                  <>
                    <div className="absolute inset-0">
                      <img
                        src={src || EVENT_IMAGES.cultural}
                        alt={hero.title}
                        className="h-full w-full object-cover opacity-90"
                        onError={(e) => {
                          e.currentTarget.src = EVENT_IMAGES.cultural;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-tr from-ink via-ink/70 to-primary/40" />
                    </div>
                    <div className="relative flex min-h-[280px] flex-col justify-end p-8 md:min-h-[320px]">
                      <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur">
                        <Flame className="h-3.5 w-3.5 text-gold" />
                        Spotlight
                      </div>
                      <h3 className="font-display text-2xl font-bold leading-tight md:text-3xl">
                        {hero.eventTitle || hero.title}
                      </h3>
                      <p className="mt-3 line-clamp-3 max-w-prose text-sm leading-relaxed text-white/85">
                        {hero.description ||
                          "Experience the energy of our latest campus gathering."}
                      </p>
                      <div className="mt-6 flex flex-wrap gap-4 text-xs uppercase tracking-wider text-white/75">
                        {hero.eventDate && (
                          <span>{format(parseISO(hero.eventDate), "MMM d, yyyy")}</span>
                        )}
                        <span>{hero.category}</span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </article>

            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
              {items.slice(1).map((item, idx) => {
                const src = resolveGalleryImageUrl(item.imageUrl);
                return (
                  <article
                    key={item.id}
                    className={cn(
                      "group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg",
                      idx >= 4 && "hidden sm:flex",
                    )}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      <img
                        src={src || EVENT_IMAGES.tech}
                        alt={item.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        onError={(e) => {
                          e.currentTarget.src = EVENT_IMAGES.tech;
                        }}
                      />
                      {item.isFeatured && (
                        <span className="absolute left-3 top-3 rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h4 className="font-display text-base font-semibold leading-snug line-clamp-2">
                        {item.eventTitle || item.title}
                      </h4>
                      <p className="mt-2 line-clamp-2 flex-1 text-xs text-muted-foreground">
                        {item.description}
                      </p>
                      <div className="mt-3 flex items-center justify-between text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        <span>
                          {item.eventDate ? format(parseISO(item.eventDate), "MMM d") : "—"}
                        </span>
                        <span className="text-primary">{item.category}</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
