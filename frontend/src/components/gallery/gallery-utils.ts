import { format, isBefore, parseISO, startOfDay } from "date-fns";
import type { GalleryImage } from "@/lib/api/gallery";

export function mergeVenuesFromEvents(
  images: GalleryImage[],
  events: { id: string; venue: string }[],
): GalleryImage[] {
  const map = new Map(events.map((e) => [e.id, e.venue]));
  return images.map((img) => ({
    ...img,
    eventVenue: img.eventVenue ?? (img.eventId != null ? map.get(String(img.eventId)) : undefined),
  }));
}

/** yyyy-MM -> images sorted newest first within month */
export function groupGalleryByMonth(
  images: GalleryImage[],
): { key: string; label: string; items: GalleryImage[] }[] {
  const map = new Map<string, GalleryImage[]>();
  for (const img of images) {
    if (!img.eventDate) continue;
    let d: Date;
    try {
      d = parseISO(img.eventDate);
      if (Number.isNaN(d.getTime())) continue;
    } catch {
      continue;
    }
    const key = format(d, "yyyy-MM");
    const list = map.get(key) ?? [];
    list.push(img);
    map.set(key, list);
  }
  const keys = Array.from(map.keys()).sort((a, b) => b.localeCompare(a));
  return keys.map((key) => {
    const items = (map.get(key) ?? []).sort((a, b) => {
      const da = a.eventDate ? parseISO(a.eventDate).getTime() : 0;
      const db = b.eventDate ? parseISO(b.eventDate).getTime() : 0;
      return db - da;
    });
    const label = format(parseISO(`${key}-01`), "MMMM yyyy");
    return { key, label, items };
  });
}

export function isEventDayBeforeToday(dateStr: string): boolean {
  try {
    const d = parseISO(dateStr);
    if (Number.isNaN(d.getTime())) return false;
    return isBefore(startOfDay(d), startOfDay(new Date()));
  } catch {
    return false;
  }
}

export function pickShowcaseItems(images: GalleryImage[], limit = 12): GalleryImage[] {
  const past = images.filter((g) => g.eventDate && isEventDayBeforeToday(g.eventDate));
  const sortedPast = [...past].sort((a, b) => {
    const ta = a.eventDate ? parseISO(a.eventDate).getTime() : 0;
    const tb = b.eventDate ? parseISO(b.eventDate).getTime() : 0;
    return tb - ta;
  });
  if (sortedPast.length >= 4) return sortedPast.slice(0, limit);
  const fallback = [...images].sort((a, b) => {
    const ta = a.eventDate ? parseISO(a.eventDate).getTime() : 0;
    const tb = b.eventDate ? parseISO(b.eventDate).getTime() : 0;
    return tb - ta;
  });
  return fallback.slice(0, limit);
}

export function pickRecentActivities(images: GalleryImage[], limit = 10): GalleryImage[] {
  const featured = images.filter((g) => g.isFeatured);
  const byDate = [...images].sort((a, b) => {
    const ta = a.eventDate ? parseISO(a.eventDate).getTime() : 0;
    const tb = b.eventDate ? parseISO(b.eventDate).getTime() : 0;
    return tb - ta;
  });
  const seen = new Set<number>();
  const out: GalleryImage[] = [];
  for (const g of featured) {
    if (seen.has(g.id)) continue;
    seen.add(g.id);
    out.push(g);
    if (out.length >= limit) return out;
  }
  for (const g of byDate) {
    if (seen.has(g.id)) continue;
    seen.add(g.id);
    out.push(g);
    if (out.length >= limit) break;
  }
  return out;
}
