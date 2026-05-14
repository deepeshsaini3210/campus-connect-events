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

export const events: CollegeEvent[] = [
  {
    id: "evt-001",
    title: "InnovateX 2026 — National Hackathon",
    category: "Hackathon",
    date: "2026-06-12", time: "09:00 AM",
    venue: "Engineering Block, Main Auditorium",
    mode: "Offline", fee: 0, seatsTotal: 500, seatsLeft: 142,
    deadline: "2026-06-05", organizer: "School of Engineering",
    college: "Mandsaur University", isPartner: false, featured: true,
    image: tech,
    description: "A 36-hour national-level hackathon bringing together the brightest minds across India to solve real-world challenges in AI, sustainability, fintech and edtech.",
    highlights: ["Prize pool ₹5,00,000", "Mentorship from industry experts", "Free meals & accommodation", "Internship opportunities"],
  },
  {
    id: "evt-002",
    title: "Sanskriti — Annual Cultural Fest",
    category: "Fest",
    date: "2026-05-22", time: "06:00 PM",
    venue: "Open Air Theatre",
    mode: "Offline", fee: 199, seatsTotal: 2000, seatsLeft: 612,
    deadline: "2026-05-20", organizer: "Cultural Committee",
    college: "Mandsaur University", isPartner: false, featured: true,
    image: cultural,
    description: "Three days of music, dance, drama and art celebrating India's rich cultural heritage with performances from 40+ colleges.",
    highlights: ["Celebrity night", "Inter-college competitions", "Food festival", "Art exhibitions"],
  },
  {
    id: "evt-003",
    title: "Inter-University Cricket Championship",
    category: "Sports",
    date: "2026-06-01", time: "08:00 AM",
    venue: "MU Sports Ground",
    mode: "Offline", fee: 0, seatsTotal: 800, seatsLeft: 320,
    deadline: "2026-05-28", organizer: "Sports Department",
    college: "Mandsaur University", isPartner: false,
    image: sports,
    description: "16 universities. One trophy. Cheer your team to victory at the most anticipated inter-university tournament of the year.",
    highlights: ["16 participating teams", "Live commentary", "Live streaming"],
  },
  {
    id: "evt-004",
    title: "AI & Future of Work — Industry Seminar",
    category: "Seminar",
    date: "2026-05-18", time: "11:00 AM",
    venue: "Convention Hall",
    mode: "Hybrid", fee: 0, seatsTotal: 350, seatsLeft: 89,
    deadline: "2026-05-17", organizer: "School of Business",
    college: "IIT Indore", isPartner: true, featured: true,
    image: seminar,
    description: "Industry leaders from Microsoft, Google and TCS discuss how AI is reshaping careers and what students must learn today to thrive tomorrow.",
    highlights: ["Networking lunch", "Q&A with leaders", "Certificate of participation"],
  },
  {
    id: "evt-005",
    title: "Robotics Workshop — Build Your First Bot",
    category: "Workshop",
    date: "2026-05-30", time: "10:00 AM",
    venue: "Robotics Lab, Block C",
    mode: "Offline", fee: 499, seatsTotal: 60, seatsLeft: 12,
    deadline: "2026-05-25", organizer: "IEEE Student Chapter",
    college: "Mandsaur University", isPartner: false,
    image: workshop,
    description: "Hands-on 2-day workshop where you'll build, program and demo your own line-following robot. Kits included.",
    highlights: ["Take-home robot kit", "Expert mentors", "Certification"],
  },
  {
    id: "evt-006",
    title: "Mega Placement Drive — TCS, Infosys, Wipro",
    category: "Placement",
    date: "2026-06-08", time: "09:00 AM",
    venue: "Training & Placement Cell",
    mode: "Offline", fee: 0, seatsTotal: 1000, seatsLeft: 421,
    deadline: "2026-06-05", organizer: "Placement Cell",
    college: "Mandsaur University", isPartner: false,
    image: placement,
    description: "Final-year students, get ready! Three top recruiters on a single day with combined intake of 200+ offers.",
    highlights: ["3 companies", "On-spot offers", "Mock interview prep included"],
  },
  {
    id: "evt-007",
    title: "CodeStorm — Competitive Programming",
    category: "Competition",
    date: "2026-05-25", time: "02:00 PM",
    venue: "CS Department Lab",
    mode: "Online", fee: 0, seatsTotal: 200, seatsLeft: 67,
    deadline: "2026-05-23", organizer: "CodeChef MU Chapter",
    college: "DAVV Indore", isPartner: true,
    image: tech,
    description: "3-hour algorithmic battle. Top 10 win cash prizes and direct interview shortlists from sponsoring tech companies.",
    highlights: ["Cash prizes ₹50,000", "Sponsored by tech firms", "All India ranking"],
  },
  {
    id: "evt-008",
    title: "Startup Pitch Day — Get Funded",
    category: "Technical",
    date: "2026-06-15", time: "10:00 AM",
    venue: "Innovation Centre",
    mode: "Offline", fee: 299, seatsTotal: 150, seatsLeft: 38,
    deadline: "2026-06-12", organizer: "E-Cell",
    college: "IIM Indore", isPartner: true,
    image: seminar,
    description: "Pitch your startup to a panel of VCs and angel investors. Selected ideas receive seed funding up to ₹10 lakh.",
    highlights: ["VC panel", "Seed funding opportunity", "Media coverage"],
  },
];

export const partnerColleges = [
  { name: "IIT Indore", offers: 3 },
  { name: "DAVV Indore", offers: 5 },
  { name: "IIM Indore", offers: 2 },
  { name: "MITS Gwalior", offers: 4 },
  { name: "SGSITS Indore", offers: 3 },
  { name: "Medi-Caps University", offers: 6 },
];

export const collaborationOffers = [
  { college: "IIT Indore", offer: "30% discount on all paid events for MU students", validity: "Till Dec 2026" },
  { college: "DAVV Indore", offer: "50 reserved seats for every collaborative fest", validity: "Academic Year 2026" },
  { college: "IIM Indore", offer: "Free access to leadership seminars (worth ₹2,000)", validity: "Limited time" },
  { college: "MITS Gwalior", offer: "Joint hackathon participation with shared prizes", validity: "Ongoing" },
];

export const testimonials = [
  { name: "Priya Sharma", role: "B.Tech CSE, 3rd Year", quote: "I discovered the IIT Indore hackathon through this portal and ended up winning runner-up. The platform changed my college experience." },
  { name: "Aarav Patel", role: "MBA, 2nd Year", quote: "The collaboration discounts saved me thousands. I attended 8 inter-college events last semester alone." },
  { name: "Dr. Meera Joshi", role: "Faculty Coordinator", quote: "Managing registrations and approvals has never been easier. The admin dashboard is a game-changer for organizers." },
];

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
