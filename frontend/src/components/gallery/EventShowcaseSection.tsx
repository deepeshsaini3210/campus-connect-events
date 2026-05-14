import { format, parseISO } from "date-fns";
import { Calendar, MapPin, ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import type { GalleryImage } from "@/lib/api/gallery";
import { resolveGalleryImageUrl } from "@/lib/api/gallery";
import { EVENT_IMAGES } from "@/lib/events-data";
import { cn } from "@/lib/utils";

type Props = {
  items: GalleryImage[];
};

function ShowcaseCard({ item }: { item: GalleryImage }) {
  const img = resolveGalleryImageUrl(item.imageUrl);
  const title = item.eventTitle?.trim() || item.title;
  const desc =
    item.description?.trim() ||
    `${item.category} highlight — moments from ${item.eventTitle || "campus life"}.`;
  const dateLabel = item.eventDate
    ? format(parseISO(item.eventDate), "EEEE, MMM d, yyyy")
    : "Date TBA";
  const venue = item.eventVenue?.trim() || "Mandsaur University campus";

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-border/80 bg-card shadow-md transition-all duration-300",
        "hover:-translate-y-1 hover:border-primary/35 hover:shadow-xl",
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={img || EVENT_IMAGES.tech}
          alt={title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          onError={(e) => {
            e.currentTarget.src = EVENT_IMAGES.tech;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent opacity-90 transition group-hover:opacity-95" />
        <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary shadow-sm backdrop-blur">
          {item.category}
        </span>
        <Link
          to="/events"
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur transition hover:bg-white/25 group-hover:opacity-100"
          aria-label="Browse events"
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="space-y-3 p-5 md:p-6">
        <h3 className="font-display text-lg font-semibold leading-snug tracking-tight md:text-xl">
          {title}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
        <div className="flex flex-col gap-2 border-t border-border/80 pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-primary" />
            {dateLabel}
          </span>
          <span className="inline-flex items-center gap-2 sm:text-right">
            <MapPin className="h-4 w-4 shrink-0 text-primary" />
            <span className="line-clamp-1">{venue}</span>
          </span>
        </div>
      </div>
    </Card>
  );
}

export function EventShowcaseSection({ items }: Props) {
  return (
    <section className="border-b border-border bg-secondary/30 py-16 md:py-20">
      <div className="container-page">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Event showcase
            </p>
            <h2 className="font-display mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              Past event highlights
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Photography and coverage from completed programmes — titles and venues are linked to
              official events when available.
            </p>
          </div>
        </div>
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/80 px-6 py-16 text-center">
            <p className="text-muted-foreground">
              No gallery entries yet. Seed the database or add images via the admin workflow.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <ShowcaseCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
