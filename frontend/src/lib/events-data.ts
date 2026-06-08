import tech from "@/assets/event-tech.jpg";
import cultural from "@/assets/event-cultural.jpg";
import sports from "@/assets/event-sports.jpg";
import seminar from "@/assets/event-seminar.jpg";
import workshop from "@/assets/event-workshop.jpg";
import placement from "@/assets/event-placement.jpg";

export type EventCategory =
  | "Technical" | "Cultural" | "Sports" | "Workshop"
  | "Seminar" | "Hackathon" | "Fest" | "Placement" | "Competition";

export interface CollegeEvent {
  id: string;
  title: string;
  category: EventCategory;
  date: string;
  time: string;
  venue: string;
  mode: "Online" | "Offline" | "Hybrid";
  fee: number;
  seatsTotal: number;
  seatsLeft: number;
  deadline: string;
  organizer: string;
  college: string;
  isPartner: boolean;
  featured?: boolean;
  image: string;
  description: string;
  highlights: string[];
  /** Backend workflow status when loaded from API (e.g. DRAFT, APPROVED). */
  approvalStatus?: string;
}

export const EVENT_IMAGES = { tech, cultural, sports, seminar, workshop, placement };

/** Legacy export — always empty; event listings come from the API only. */
export const events: CollegeEvent[] = [];

export const categories: EventCategory[] = [
  "Technical", "Cultural", "Sports", "Workshop", "Seminar", "Hackathon", "Fest", "Placement", "Competition",
];

/** Matches `event_categories.id` in backend seed (`database-schema.sql` / `seed-frontend-data.sql`). */
export const EVENT_CATEGORY_IDS: Record<EventCategory, number> = {
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
