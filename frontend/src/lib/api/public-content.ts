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

/** Static demo partner colleges — shown when the API returns none. */
export const HOME_PARTNER_COLLEGES: PartnerCollege[] = [
  { id: 101, name: "IIT Indore", code: "IITI", city: "Indore", state: "MP", activeOffers: 2 },
  { id: 102, name: "DAVV Indore", code: "DAVV", city: "Indore", state: "MP", activeOffers: 1 },
  { id: 103, name: "IIM Indore", code: "IIMI", city: "Indore", state: "MP", activeOffers: 1 },
  { id: 104, name: "MITS Gwalior", code: "MITS", city: "Gwalior", state: "MP", activeOffers: 1 },
  { id: 105, name: "SGSITS Indore", code: "SGSITS", city: "Indore", state: "MP", activeOffers: 2 },
  { id: 106, name: "Medi-Caps University", code: "MEDICAPS", city: "Indore", state: "MP", activeOffers: 1 },
];

/** Static demo collaboration perks — shown when the API returns none. */
export const HOME_COLLABORATION_OFFERS: CollaborationOffer[] = [
  {
    collaborationId: 1,
    college: "IIT Indore",
    offer: "50% registration fee waiver for MU students at Techfest workshops.",
    validity: "Jun–Dec 2026",
  },
  {
    collaborationId: 2,
    college: "DAVV Indore",
    offer: "Reserved 30 seats for MU students at the National Cultural Meet.",
    validity: "Valid 2026",
  },
  {
    collaborationId: 3,
    college: "SGSITS Indore",
    offer: "Joint hackathon track with a shared ₹2L prize pool for cross-campus teams.",
    validity: "Aug 2026",
  },
  {
    collaborationId: 4,
    college: "IIM Indore",
    offer: "Priority enrollment for MU MBA students in the entrepreneurship bootcamp.",
    validity: "Quarterly",
  },
];

export function resolvePartnerColleges(fromApi: PartnerCollege[]): PartnerCollege[] {
  return fromApi.length > 0 ? fromApi : HOME_PARTNER_COLLEGES;
}

export function resolveCollaborationOffers(fromApi: CollaborationOffer[]): CollaborationOffer[] {
  return fromApi.length > 0 ? fromApi : HOME_COLLABORATION_OFFERS;
}

/** Static demo content for the home page — not loaded from the API. */
export const HOME_TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Priya Sharma",
    role: "B.Tech CSE, 3rd Year",
    quote:
      "MU Events made it so easy to discover hackathons and workshops. I booked my first inter-college competition in under two minutes!",
  },
  {
    id: 2,
    name: "Rahul Meena",
    role: "MBA, 1st Year",
    quote:
      "The collaboration offers with partner colleges are incredible. I would have missed that national seminar without this portal.",
  },
  {
    id: 3,
    name: "Ananya Patel",
    role: "B.Pharm, Final Year",
    quote:
      "From cultural fests to placement drives, everything is in one place. The QR ticket check-in at the gate was seamless.",
  },
];

export type CollaborationRequestPayload = {
  requesterCollegeId: number;
  partnerUniversityName: string;
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
