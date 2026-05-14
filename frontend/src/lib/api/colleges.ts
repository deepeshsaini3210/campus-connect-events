import { getApiBaseUrl } from "@/lib/api/auth";
import type { PartnerCollege } from "@/lib/api/public-content";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

export async function fetchColleges(): Promise<Pick<PartnerCollege, "id" | "name" | "code">[]> {
  const response = await fetch(`${getApiBaseUrl()}/v1/public/partner-colleges`);
  if (!response.ok) throw new Error("Could not load colleges.");
  const payload = (await response.json()) as ApiEnvelope<PartnerCollege[]>;
  return (payload.data || []).map((c) => ({ id: c.id, name: c.name, code: c.code }));
}
