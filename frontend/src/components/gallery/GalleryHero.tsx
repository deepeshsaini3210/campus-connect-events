import { Camera, Images, Sparkles } from "lucide-react";

type Props = {
  totalPhotos: number;
  monthCount: number;
};

export function GalleryHero({ totalPhotos, monthCount }: Props) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-ink via-ink/95 to-primary/30 text-ink-foreground">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-primary blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-gold/30 blur-3xl" />
      </div>
      <div className="relative container-page py-16 md:py-20 lg:py-28">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-gold" />
          Campus memories · Official archive
        </div>
        <h1 className="font-display mt-6 max-w-4xl text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
          Event <span className="text-gradient-primary">Gallery</span>
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
          Relive hackathons, cultural nights, sports finals and seminars — curated from live
          university events and synced with our events database.
        </p>
        <div className="mt-10 grid max-w-lg grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:gap-6">
          <div className="rounded-xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur transition hover:bg-white/15">
            <div className="flex items-center gap-2 text-gold">
              <Images className="h-5 w-5" />
              <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
                Moments captured
              </span>
            </div>
            <div className="font-display mt-1 text-3xl font-bold">{totalPhotos}</div>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur transition hover:bg-white/15">
            <div className="flex items-center gap-2 text-gold">
              <Camera className="h-5 w-5" />
              <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
                Months on record
              </span>
            </div>
            <div className="font-display mt-1 text-3xl font-bold">{monthCount}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
