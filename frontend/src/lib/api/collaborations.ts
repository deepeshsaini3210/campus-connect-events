import { getApiBaseUrl } from "@/lib/api/auth";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};

type Paginated<T> = {
  content: T[];
  totalElements: number;
};

export type CollaborationRequest = {
  id: number;
  requesterCollege: { id: number; name: string; code?: string };
  partnerCollege: { id: number; name: string; code?: string };
  status: string;
  coordinatorName?: string | null;
  coordinatorEmail?: string | null;
  notes?: string | null;
  specialOffers?: string | null;
  requestDate: string;
  responseDate?: string | null;
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

export async function fetchCollaborationRequests(params: {
  status?: string;
  page?: number;
  size?: number;
} = {}): Promise<CollaborationRequest[]> {
  const search = new URLSearchParams();
  search.set("page", String(params.page ?? 0));
  search.set("size", String(params.size ?? 50));
  if (params.status) search.set("status", params.status);

  const response = await fetch(`${getApiBaseUrl()}/v1/collaborations/requests?${search}`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Could not load collaboration requests.");
  const payload = (await response.json()) as ApiEnvelope<Paginated<CollaborationRequest>>;
  return payload.data?.content || [];
}

export async function approveCollaborationRequest(id: number): Promise<void> {
  const response = await fetch(`${getApiBaseUrl()}/v1/collaborations/requests/${id}/approve`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!response.ok) {
    const raw = await response.json().catch(() => ({}));
    throw new Error((raw as { message?: string }).message || "Could not approve request.");
  }
}

export async function rejectCollaborationRequest(id: number, reason?: string): Promise<void> {
  const query = reason ? `?reason=${encodeURIComponent(reason)}` : "";
  const response = await fetch(`${getApiBaseUrl()}/v1/collaborations/requests/${id}/reject${query}`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!response.ok) {
    const raw = await response.json().catch(() => ({}));
    throw new Error((raw as { message?: string }).message || "Could not reject request.");
  }
}
