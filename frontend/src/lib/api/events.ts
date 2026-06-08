import { EVENT_IMAGES, type CollegeEvent, type EventCategory } from "@/lib/events-data";
import { getApiBaseUrl } from "@/lib/api/auth";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};

type PaginatedData<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

type BackendEvent = {
  id: number;
  title: string;
  description: string;
  category?: { name?: string };
  organizer?: { firstName?: string; lastName?: string };
  college?: { name?: string };
  eventDate: string;
  eventTime: string;
  venue: string;
  mode: "ONLINE" | "OFFLINE" | "HYBRID";
  fee: number;
  seatsTotal: number;
  seatsLeft: number;
  deadline: string;
  isFeatured?: boolean;
  isPartnerEvent?: boolean;
  imageUrl?: string | null;
  highlights?: string[];
  status?: string;
};

const modeMap: Record<BackendEvent["mode"], CollegeEvent["mode"]> = {
  ONLINE: "Online",
  OFFLINE: "Offline",
  HYBRID: "Hybrid",
};

const defaultImageByCategory: Record<EventCategory, string> = {
  Technical: EVENT_IMAGES.tech,
  Cultural: EVENT_IMAGES.cultural,
  Sports: EVENT_IMAGES.sports,
  Workshop: EVENT_IMAGES.workshop,
  Seminar: EVENT_IMAGES.seminar,
  Hackathon: EVENT_IMAGES.tech,
  Fest: EVENT_IMAGES.cultural,
  Placement: EVENT_IMAGES.placement,
  Competition: EVENT_IMAGES.tech,
};

/** Backend may return full MinIO URLs or app-relative paths — use for event card images. */
export function resolveEventImageUrl(url: string | undefined | null): string {
  if (url == null || url === "") return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  const base = getApiBaseUrl().replace(/\/api\/?$/, "");
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${base}${path}`;
}

const safeCategory = (categoryName?: string): EventCategory => {
  const allowed: EventCategory[] = [
    "Technical",
    "Cultural",
    "Sports",
    "Workshop",
    "Seminar",
    "Hackathon",
    "Fest",
    "Placement",
    "Competition",
  ];
  return allowed.includes(categoryName as EventCategory) ? (categoryName as EventCategory) : "Technical";
};

const formatTime = (time24: string): string => {
  const [hourRaw, minuteRaw] = time24.split(":");
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return time24;
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${String(hour12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${suffix}`;
};

const toCollegeEvent = (event: BackendEvent): CollegeEvent => {
  const category = safeCategory(event.category?.name);
  const organizerName = [event.organizer?.firstName, event.organizer?.lastName].filter(Boolean).join(" ").trim();
  const img = resolveEventImageUrl(event.imageUrl);
  return {
    id: String(event.id),
    title: event.title,
    category,
    date: event.eventDate,
    time: formatTime(event.eventTime),
    venue: event.venue,
    mode: modeMap[event.mode] ?? "Offline",
    fee: Number(event.fee ?? 0),
    seatsTotal: Number(event.seatsTotal ?? 0),
    seatsLeft: Number(event.seatsLeft ?? 0),
    deadline: event.deadline,
    organizer: organizerName || "Event Organizer",
    college: event.college?.name || "Mandsaur University",
    isPartner: Boolean(event.isPartnerEvent),
    featured: Boolean(event.isFeatured),
    image: img || defaultImageByCategory[category],
    description: event.description,
    highlights: event.highlights && event.highlights.length > 0 ? event.highlights : ["Details will be shared soon."],
    approvalStatus: event.status,
  };
};

const buildQuery = (params: Record<string, string | number | boolean | undefined>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") searchParams.set(key, String(value));
  });
  return searchParams.toString();
};

export type FetchEventsParams = {
  keyword?: string;
  mode?: "ONLINE" | "OFFLINE" | "HYBRID";
  categoryId?: number;
  freeOnly?: boolean;
  paidOnly?: boolean;
  isFeatured?: boolean;
  page?: number;
  size?: number;
  status?: string;
  /** Omit status filter to load events in every workflow state (admin). */
  includeAllStatuses?: boolean;
  signal?: AbortSignal;
};

export async function fetchEventsPage(params: FetchEventsParams = {}): Promise<{
  events: CollegeEvent[];
  totalElements: number;
  totalPages: number;
}> {
  const { includeAllStatuses, status, signal, ...rest } = params;
  const filters: Record<string, string | number | boolean | undefined> = {
    page: 0,
    size: 100,
    ...rest,
  };
  if (includeAllStatuses) {
    if (status !== undefined) {
      filters.status = status;
    }
  } else {
    filters.status = status ?? "APPROVED";
  }
  const query = buildQuery(filters);
  const response = await fetch(`${getApiBaseUrl()}/v1/events?${query}`, { signal });
  if (!response.ok) throw new Error("Unable to fetch events from backend.");

  const payload = (await response.json()) as ApiEnvelope<PaginatedData<BackendEvent>>;
  const pageData = payload.data;
  return {
    events: (pageData?.content || []).map(toCollegeEvent),
    totalElements: pageData?.totalElements ?? 0,
    totalPages: pageData?.totalPages ?? 0,
  };
}

export async function fetchEvents(params: FetchEventsParams = {}): Promise<CollegeEvent[]> {
  const { events } = await fetchEventsPage(params);
  return events;
}

async function fetchEventsFromCollectionPath(
  path: "featured" | "upcoming",
  params: { page?: number; size?: number } = {},
): Promise<CollegeEvent[]> {
  const query = buildQuery({ page: params.page ?? 0, size: params.size ?? 20 });
  const response = await fetch(`${getApiBaseUrl()}/v1/events/${path}?${query}`);
  if (!response.ok) throw new Error(`Unable to fetch ${path} events from backend.`);

  const payload = (await response.json()) as ApiEnvelope<PaginatedData<BackendEvent>>;
  return (payload.data?.content || []).map(toCollegeEvent);
}

/** Approved featured events with event date on or after today (backend ordering). */
export async function fetchFeaturedEvents(params: { page?: number; size?: number } = {}): Promise<CollegeEvent[]> {
  return fetchEventsFromCollectionPath("featured", params);
}

/** Approved upcoming events, soonest first. */
export async function fetchUpcomingEvents(params: { page?: number; size?: number } = {}): Promise<CollegeEvent[]> {
  return fetchEventsFromCollectionPath("upcoming", params);
}

export async function fetchEventById(eventId: string): Promise<CollegeEvent> {
  const dto = await fetchEventRawById(eventId);
  return toCollegeEvent(dto);
}

export async function fetchEventRawById(eventId: string): Promise<BackendEvent> {
  const response = await fetch(`${getApiBaseUrl()}/v1/events/${eventId}`);
  if (!response.ok) throw new Error("Unable to fetch event details.");
  const payload = (await response.json()) as ApiEnvelope<BackendEvent>;
  return payload.data;
}

const CATEGORY_NAME_TO_ID: Record<string, number> = {
  Technical: 1,
  Cultural: 2,
  Sports: 3,
  Workshop: 4,
  Seminar: 5,
  Hackathon: 6,
  Fest: 7,
  Placement: 8,
  Competition: 9,
};

export function categoryNameToId(name: string): number {
  return CATEGORY_NAME_TO_ID[name] ?? 1;
}

export type CreateEventPayload = {
  title: string;
  description: string;
  categoryId: number;
  eventDate: string;
  eventTime: string;
  venue: string;
  mode: "ONLINE" | "OFFLINE" | "HYBRID";
  fee: number;
  seatsTotal: number;
  deadline: string;
  isFeatured?: boolean;
  isPartnerEvent?: boolean;
  highlights?: string[];
};

/** Upload a poster image to MinIO via the API; returns the public URL (e.g. for updates). */
export async function uploadEventImage(file: File): Promise<string> {
  const token =
    typeof globalThis !== "undefined" && "localStorage" in globalThis
      ? globalThis.localStorage.getItem("token")
      : null;
  if (!token) throw new Error("Sign in to upload an image.");

  const form = new FormData();
  form.append("file", file);

  const response = await fetch(`${getApiBaseUrl()}/v1/events/images`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const raw = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg =
      (raw as { message?: string }).message ||
      (raw as { error?: string }).error ||
      `Upload failed (${response.status})`;
    throw new Error(msg);
  }
  const url = unwrapApiData<string>(raw);
  if (typeof url === "string" && url.trim()) return url.trim();
  throw new Error("Invalid upload response.");
}

function unwrapApiData<T>(raw: unknown): T {
  if (raw && typeof raw === "object" && "data" in raw && (raw as { data: unknown }).data !== undefined) {
    return (raw as { data: T }).data;
  }
  return raw as T;
}

export async function createEvent(payload: CreateEventPayload, image: File): Promise<CollegeEvent> {
  const token =
    typeof globalThis !== "undefined" && "localStorage" in globalThis
      ? globalThis.localStorage.getItem("token")
      : null;
  if (!token) throw new Error("Sign in to create an event.");

  const eventJson = {
    title: payload.title.trim(),
    description: payload.description.trim(),
    categoryId: payload.categoryId,
    eventDate: payload.eventDate,
    eventTime: payload.eventTime,
    venue: payload.venue.trim(),
    mode: payload.mode,
    fee: payload.fee,
    seatsTotal: payload.seatsTotal,
    deadline: payload.deadline,
    isFeatured: Boolean(payload.isFeatured),
    isPartnerEvent: Boolean(payload.isPartnerEvent),
    highlights: payload.highlights && payload.highlights.length > 0 ? payload.highlights : undefined,
  };

  const form = new FormData();
  form.append("event", new Blob([JSON.stringify(eventJson)], { type: "application/json" }));
  form.append("image", image);

  const response = await fetch(`${getApiBaseUrl()}/v1/events`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
  });
  const raw = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg =
      (raw as { message?: string }).message ||
      (raw as { error?: string }).error ||
      `Could not create event (${response.status})`;
    throw new Error(msg);
  }
  const dto = unwrapApiData<BackendEvent>(raw);
  return toCollegeEvent(dto);
}

export async function approveEvent(eventId: string | number): Promise<void> {
  const token =
    typeof globalThis !== "undefined" && "localStorage" in globalThis
      ? globalThis.localStorage.getItem("token")
      : null;
  const response = await fetch(`${getApiBaseUrl()}/v1/events/${eventId}/approve`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) {
    const raw = await response.json().catch(() => ({}));
    throw new Error((raw as { message?: string }).message || "Could not approve event.");
  }
}

export type UpdateEventPayload = {
  title?: string;
  description?: string;
  categoryId?: number;
  eventDate?: string;
  eventTime?: string;
  venue?: string;
  mode?: "ONLINE" | "OFFLINE" | "HYBRID";
  fee?: number;
  seatsTotal?: number;
  deadline?: string;
  isFeatured?: boolean;
  isPartnerEvent?: boolean;
  imageUrl?: string | null;
  highlights?: string[];
};

export async function updateEvent(eventId: string | number, payload: UpdateEventPayload): Promise<CollegeEvent> {
  const token =
    typeof globalThis !== "undefined" && "localStorage" in globalThis
      ? globalThis.localStorage.getItem("token")
      : null;
  const response = await fetch(`${getApiBaseUrl()}/v1/events/${eventId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  const raw = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((raw as { message?: string }).message || "Could not update event.");
  }
  const dto = unwrapApiData<BackendEvent>(raw);
  return toCollegeEvent(dto);
}

export async function deleteEvent(eventId: string | number): Promise<string> {
  const token =
    typeof globalThis !== "undefined" && "localStorage" in globalThis
      ? globalThis.localStorage.getItem("token")
      : null;
  const response = await fetch(`${getApiBaseUrl()}/v1/events/${eventId}`, {
    method: "DELETE",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const raw = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((raw as { message?: string }).message || "Could not delete event.");
  }
  return (raw as { message?: string }).message || "Event deleted successfully.";
}

/** Draft + pending events awaiting admin approval */
export async function fetchPendingApprovalEvents(): Promise<CollegeEvent[]> {
  const [draft, pending] = await Promise.all([
    fetchEvents({ includeAllStatuses: true, status: "DRAFT", page: 0, size: 100 }),
    fetchEvents({ includeAllStatuses: true, status: "PENDING_APPROVAL", page: 0, size: 100 }),
  ]);
  const byId = new Map<string, CollegeEvent>();
  for (const e of [...draft, ...pending]) byId.set(e.id, e);
  return Array.from(byId.values());
}

export async function rejectEvent(eventId: string | number, reason: string): Promise<void> {
  const token =
    typeof globalThis !== "undefined" && "localStorage" in globalThis
      ? globalThis.localStorage.getItem("token")
      : null;
  const query = new URLSearchParams({ reason });
  const response = await fetch(`${getApiBaseUrl()}/v1/events/${eventId}/reject?${query}`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) {
    const raw = await response.json().catch(() => ({}));
    throw new Error((raw as { message?: string }).message || "Could not reject event.");
  }
}
