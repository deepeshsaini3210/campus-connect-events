import { useState } from "react";
import { format, parseISO } from "date-fns";
import { FolderOpen, ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { GalleryImage } from "@/lib/api/gallery";
import { resolveGalleryImageUrl } from "@/lib/api/gallery";
import { EVENT_IMAGES } from "@/lib/events-data";
import { cn } from "@/lib/utils";

type MonthGroup = { key: string; label: string; items: GalleryImage[] };

type Props = {
  groups: MonthGroup[];
};

export function MonthFolderCollection({ groups }: Props) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const active = groups.find((g) => g.key === openKey);

  return (
    <section className="border-t border-border bg-gradient-to-b from-secondary/40 to-background py-16 md:py-22">
      <div className="container-page">
        <div className="mb-10 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Archive</p>
          <h2 className="font-display mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Browse by month
          </h2>
          <p className="mt-3 text-muted-foreground">
            Folder-style collections grouped by event date. Open any month to browse every image
            captured that period.
          </p>
        </div>

        {groups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center text-muted-foreground">
            Monthly folders appear once images include event dates.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {groups.map((g, i) => (
              <button
                key={g.key}
                type="button"
                onClick={() => setOpenKey(g.key)}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left shadow-md transition-all duration-300",
                  "hover:-translate-y-1 hover:border-primary/35 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="relative h-36 bg-gradient-to-br from-primary/15 via-card to-gold/10">
                  <div className="absolute inset-0 opacity-[0.08]">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(-45deg, oklch(0.62 0.19 42 / 0.25) 0 2px, transparent 2px 10px)",
                      }}
                    />
                  </div>
                  <div className="relative flex h-full items-center justify-center gap-3 px-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-inner ring-2 ring-primary/20 transition group-hover:scale-105 group-hover:bg-primary/25">
                      <FolderOpen className="h-8 w-8" />
                    </div>
                  </div>
                  <span className="absolute bottom-3 right-4 inline-flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-sm backdrop-blur">
                    <ImageIcon className="h-3.5 w-3.5 text-primary" />
                    {g.items.length} photos
                  </span>
                </div>
                <div className="space-y-1 px-5 pb-5 pt-4">
                  <h3 className="font-display text-lg font-semibold">{g.label}</h3>
                  <p className="text-xs text-muted-foreground">Tap to open collection</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <Dialog open={openKey !== null} onOpenChange={(o) => !o && setOpenKey(null)}>
        <DialogContent className="max-h-[90vh] max-w-4xl gap-0 overflow-hidden border-border p-0 sm:rounded-2xl">
          <DialogHeader className="border-b border-border px-6 py-4 text-left">
            <DialogTitle className="font-display text-xl">
              {active?.label ?? "Collection"}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {active ? `${active.items.length} images · synced from gallery API` : ""}
            </p>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-120px)] px-4 pb-6 pt-2">
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {active?.items.map((item) => {
                const src = resolveGalleryImageUrl(item.imageUrl);
                const title = item.eventTitle || item.title;
                return (
                  <figure
                    key={item.id}
                    className="group overflow-hidden rounded-xl border border-border bg-muted/50 shadow-sm transition hover:border-primary/30"
                  >
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <img
                        src={src || EVENT_IMAGES.tech}
                        alt={title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = EVENT_IMAGES.tech;
                        }}
                      />
                    </div>
                    <figcaption className="space-y-1 p-3">
                      <p className="line-clamp-2 text-sm font-semibold leading-snug">{title}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {item.eventDate ? format(parseISO(item.eventDate), "MMM d, yyyy") : "—"} ·{" "}
                        {item.category}
                      </p>
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </section>
  );
}
