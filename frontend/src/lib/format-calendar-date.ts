/**
 * Formats calendar dates from ISO `YYYY-MM-DD` (or ISO datetime) strings without using
 * `Date` + `toLocaleDateString`, so SSR and the browser always produce identical markup
 * (avoids hydration mismatches from timezone differences).
 */
const MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

export type CalendarYmd = { y: number; m: number; d: number };

/** Parse `YYYY-MM-DD` prefix from ISO date strings (SSR-safe, no locale). */
export function parseCalendarYmd(iso: string): CalendarYmd | null {
  const base = iso.trim().split("T")[0] ?? "";
  const parts = base.split("-");
  if (parts.length !== 3) return null;
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d) || m < 1 || m > 12 || d < 1 || d > 31) {
    return null;
  }
  return { y, m, d };
}

/** e.g. `18 May 2026` */
export function formatCalendarDateMedium(iso: string): string {
  const parsed = parseCalendarYmd(iso);
  if (!parsed) return iso;
  return `${parsed.d} ${MONTHS_SHORT[parsed.m - 1]} ${parsed.y}`;
}

/** e.g. `18 May 2026` with full month name */
export function formatCalendarDateLong(iso: string): string {
  const parsed = parseCalendarYmd(iso);
  if (!parsed) return iso;
  return `${parsed.d} ${MONTHS_LONG[parsed.m - 1]} ${parsed.y}`;
}

/** e.g. `18 May` */
export function formatCalendarDayMonth(iso: string): string {
  const parsed = parseCalendarYmd(iso);
  if (!parsed) return iso;
  return `${parsed.d} ${MONTHS_SHORT[parsed.m - 1]}`;
}

/** Full month name + year for calendar headings. */
export function formatCalendarMonthYearHeading(year: number, month1to12: number): string {
  if (month1to12 < 1 || month1to12 > 12) return `${month1to12}/${year}`;
  return `${MONTHS_LONG[month1to12 - 1]} ${year}`;
}

export function getCalendarMonthShort(month1to12: number): string {
  if (month1to12 < 1 || month1to12 > 12) return "";
  return MONTHS_SHORT[month1to12 - 1];
}
