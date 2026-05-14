import { getApiBaseUrl } from "@/lib/api/auth";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

type Paginated<T> = {
  content: T[];
};

export type BookingItem = {
  id: number;
  bookingReference: string;
  status: string;
  event: {
    id: number;
    title: string;
    category: string;
    collegeName: string;
    eventDate: string;
    eventTime: string;
    venue: string;
    mode: string;
    fee: number;
    imageUrl?: string | null;
  };
};

export type NotificationItem = {
  id: number;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  isRead: boolean;
  createdAt: string;
};

function authHeaders() {
  const token =
    typeof globalThis !== "undefined" && "localStorage" in globalThis
      ? globalThis.localStorage.getItem("token")
      : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchMyBookings(): Promise<BookingItem[]> {
  const response = await fetch(`${getApiBaseUrl()}/v1/bookings/my-bookings?page=0&size=100`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Could not load bookings.");
  const payload = (await response.json()) as ApiEnvelope<Paginated<BookingItem>>;
  return payload.data?.content || [];
}

export async function fetchMyNotifications(): Promise<NotificationItem[]> {
  const response = await fetch(`${getApiBaseUrl()}/v1/notifications/my?page=0&size=20`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Could not load notifications.");
  const payload = (await response.json()) as ApiEnvelope<Paginated<NotificationItem>>;
  return payload.data?.content || [];
}
