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

export type OnboardingEvent = {
  id: number;
  title: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  category: string;
  registrantCount: number;
};

export type Registrant = {
  userId: number;
  bookingId: number;
  fullName: string;
  email: string;
  rollNumber?: string | null;
  bookingReference: string;
  status: string;
  entered: boolean;
};

export type CheckInResult = {
  allowed: boolean;
  alreadyEntered: boolean;
  message: string;
  attendeeName?: string;
  rollNumber?: string;
  bookingReference?: string;
};

export async function fetchTodayOnboardingEvents(): Promise<OnboardingEvent[]> {
  const response = await fetch(`${getApiBaseUrl()}/v1/onboarding/events/today`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Could not load today's events.");
  const payload = (await response.json()) as ApiEnvelope<OnboardingEvent[]>;
  return payload.data || [];
}

export async function fetchEventRegistrants(eventId: number, search?: string): Promise<Registrant[]> {
  const q = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
  const response = await fetch(`${getApiBaseUrl()}/v1/onboarding/events/${eventId}/registrants${q}`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Could not load registrants.");
  const payload = (await response.json()) as ApiEnvelope<Registrant[]>;
  return payload.data || [];
}

export async function checkInAttendee(payload: {
  userId: number;
  eventId: number;
  scannedPayload: string;
}): Promise<CheckInResult> {
  const response = await fetch(`${getApiBaseUrl()}/v1/onboarding/check-in`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const raw = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((raw as { message?: string }).message || "Check-in failed.");
  }
  const envelope = raw as ApiEnvelope<CheckInResult>;
  return envelope.data;
}
