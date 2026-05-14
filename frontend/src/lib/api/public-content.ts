import { getApiBaseUrl } from "@/lib/api/auth";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type PartnerCollege = {
  id: number;
  name: string;
  code: string;
  city?: string;
  state?: string;
  logo?: string;
  activeOffers: number;
};

export type CollaborationOffer = {
  collaborationId: number;
  college: string;
  offer: string;
  validity: string;
};

export type Testimonial = {
  id: number;
  name: string;
  role: string;
  quote: string;
};

export type CollaborationRequestPayload = {
  requesterCollegeId: number;
  partnerCollegeId: number;
  coordinatorName: string;
  coordinatorEmail: string;
  notes?: string;
  specialOffers?: string;
};

export async function fetchPartnerColleges(): Promise<PartnerCollege[]> {
  const response = await fetch(`${getApiBaseUrl()}/v1/public/partner-colleges`);
  if (!response.ok) throw new Error("Could not load partner colleges.");
  const payload = (await response.json()) as ApiEnvelope<PartnerCollege[]>;
  return payload.data || [];
}

export async function fetchCollaborationOffers(): Promise<CollaborationOffer[]> {
  const response = await fetch(`${getApiBaseUrl()}/v1/public/collaboration-offers`);
  if (!response.ok) throw new Error("Could not load collaboration offers.");
  const payload = (await response.json()) as ApiEnvelope<CollaborationOffer[]>;
  return payload.data || [];
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
  const response = await fetch(`${getApiBaseUrl()}/v1/public/testimonials`);
  if (!response.ok) throw new Error("Could not load testimonials.");
  const payload = (await response.json()) as ApiEnvelope<Testimonial[]>;
  return payload.data || [];
}

export async function submitCollaborationRequest(payload: CollaborationRequestPayload): Promise<void> {
  const token =
    typeof globalThis !== "undefined" && "localStorage" in globalThis
      ? globalThis.localStorage.getItem("token")
      : null;
  const response = await fetch(`${getApiBaseUrl()}/v1/collaborations/requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  const raw = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = (raw as { message?: string }).message || "Could not submit collaboration request.";
    throw new Error(message);
  }
}
