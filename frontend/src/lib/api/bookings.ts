import { getApiBaseUrl } from "@/lib/api/auth";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
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

export type TicketBooking = {
  id: number;
  bookingReference: string;
  entryCode?: string;
  rollNumber?: string | null;
  qrCode?: string;
  qrCodeImage?: string;
  status: string;
  paymentStatus?: string;
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

export type CreateBookingResult = TicketBooking;

export async function createBooking(eventId: number, rollNumber?: string): Promise<CreateBookingResult> {
  const response = await fetch(`${getApiBaseUrl()}/v1/bookings`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ eventId, rollNumber: rollNumber?.trim() || undefined }),
  });
  const raw = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      (raw as { message?: string }).message ||
      (raw as { error?: string }).error ||
      "Could not register for this event.";
    throw new Error(message);
  }
  const payload = raw as ApiEnvelope<CreateBookingResult>;
  return payload.data;
}

export async function completeBookingPayment(bookingId: number): Promise<CreateBookingResult> {
  const response = await fetch(`${getApiBaseUrl()}/v1/bookings/${bookingId}/complete-payment`, {
    method: "POST",
    headers: authHeaders(),
  });
  const raw = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = (raw as { message?: string }).message || "Payment could not be completed.";
    throw new Error(message);
  }
  const payload = raw as ApiEnvelope<CreateBookingResult>;
  return payload.data;
}

export async function fetchBookingById(bookingId: number): Promise<TicketBooking> {
  const response = await fetch(`${getApiBaseUrl()}/v1/bookings/${bookingId}`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Could not load ticket.");
  const payload = (await response.json()) as ApiEnvelope<TicketBooking>;
  return payload.data;
}

export async function cancelBooking(bookingId: number): Promise<void> {
  const response = await fetch(`${getApiBaseUrl()}/v1/bookings/${bookingId}/cancel`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!response.ok) {
    const raw = await response.json().catch(() => ({}));
    const message = (raw as { message?: string }).message || "Could not cancel booking.";
    throw new Error(message);
  }
}
