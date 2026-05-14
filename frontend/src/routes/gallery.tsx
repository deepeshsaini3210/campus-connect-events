import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { fetchEvents } from "@/lib/api/events";
import { fetchAllGalleryImages } from "@/lib/api/gallery";
import { GalleryHero } from "@/components/gallery/GalleryHero";
import { EventShowcaseSection } from "@/components/gallery/EventShowcaseSection";
import { RecentActivitiesSection } from "@/components/gallery/RecentActivitiesSection";
import { MonthFolderCollection } from "@/components/gallery/MonthFolderCollection";
import {
  groupGalleryByMonth,
  mergeVenuesFromEvents,
  pickRecentActivities,
  pickShowcaseItems,
} from "@/components/gallery/gallery-utils";

export const Route = createFileRoute("/gallery")({
  loader: async () => {
    try {
      const [galleryRaw, events] = await Promise.all([
        fetchAllGalleryImages({ maxItems: 400, pageSize: 80 }),
        fetchEvents({ page: 0, size: 200 }).catch(() => []),
      ]);
      const gallery = mergeVenuesFromEvents(galleryRaw, events);
      const showcase = pickShowcaseItems(gallery, 12);
      const recent = pickRecentActivities(gallery, 10);
      const monthGroups = groupGalleryByMonth(gallery);
      return { gallery, showcase, recent, monthGroups };
    } catch {
      return {
        gallery: [] as Awaited<ReturnType<typeof fetchAllGalleryImages>>,
        showcase: [],
        recent: [],
        monthGroups: [] as ReturnType<typeof groupGalleryByMonth>,
      };
    }
  },
  head: () => ({
    meta: [
      { title: "Event Gallery — MU Events Portal | Mandsaur University" },
      {
        name: "description",
        content:
          "Browse campus event photography by month — hackathons, cultural fests, sports and seminars at Mandsaur University.",
      },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const { gallery, showcase, recent, monthGroups } = Route.useLoaderData();

  return (
    <RequireAuth>
      <GalleryHero totalPhotos={gallery.length} monthCount={monthGroups.length} />
      <EventShowcaseSection items={showcase} />
      <RecentActivitiesSection items={recent} />
      <MonthFolderCollection groups={monthGroups} />
    </RequireAuth>
  );
}
