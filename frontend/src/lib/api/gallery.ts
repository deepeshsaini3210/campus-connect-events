import { getApiBaseUrl } from "@/lib/api/auth";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type GalleryImage = {
  id: number;
  title: string;
  description?: string;
  eventId?: number;
  eventTitle?: string;
  /** Present when backend links an event (includes venue). */
  eventVenue?: string;
  imageUrl: string;
  eventDate: string;
  category: string;
  isFeatured: boolean;
};

export type PaginatedGallery = {
  content: GalleryImage[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

/** Absolute URL for gallery assets served from the API origin (paths like `/images/gallery/...`). */
export function resolveGalleryImageUrl(imageUrl: string | undefined | null): string {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;
  const base = getApiBaseUrl().replace(/\/api\/?$/, "");
  const path = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
  return `${base}${path}`;
}

export async function fetchGalleryPage(params?: {
  category?: string;
  featured?: boolean;
  page?: number;
  size?: number;
}): Promise<PaginatedGallery> {
  const search = new URLSearchParams();
  if (params?.category) search.set("category", params.category);
  if (params?.featured) search.set("featured", "true");
  search.set("page", String(params?.page ?? 0));
  search.set("size", String(params?.size ?? 24));
  const response = await fetch(`${getApiBaseUrl()}/v1/gallery?${search.toString()}`);
  if (!response.ok) throw new Error("Could not load gallery.");
  const payload = (await response.json()) as ApiEnvelope<PaginatedGallery>;
  return (
    payload.data ?? {
      content: [],
      pageNumber: 0,
      pageSize: 0,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
      empty: true,
    }
  );
}

/** Loads gallery pages until exhausted or max items reached (for grouping / full archive views). */
export async function fetchAllGalleryImages(options?: {
  maxItems?: number;
  category?: string;
  featured?: boolean;
  pageSize?: number;
}): Promise<GalleryImage[]> {
  const maxItems = options?.maxItems ?? 500;
  const pageSize = options?.pageSize ?? 80;
  let page = 0;
  const out: GalleryImage[] = [];
  while (out.length < maxItems) {
    const batch = await fetchGalleryPage({
      category: options?.category,
      featured: options?.featured,
      page,
      size: pageSize,
    });
    out.push(...batch.content);
    if (batch.last || batch.empty || batch.content.length === 0) break;
    page += 1;
    if (page > 50) break;
  }
  return out.slice(0, maxItems);
}

/** Backward-compatible helper used on the home page. */
export async function fetchGallery(params?: {
  category?: string;
  featured?: boolean;
  size?: number;
}): Promise<GalleryImage[]> {
  const page = await fetchGalleryPage({
    category: params?.category,
    featured: params?.featured,
    page: 0,
    size: params?.size ?? 12,
  });
  return page.content;
}
