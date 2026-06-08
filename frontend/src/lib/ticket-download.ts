import { formatCalendarDateLong } from "@/lib/format-calendar-date";
import type { TicketBooking } from "@/lib/api/bookings";

export function downloadEventTicket(booking: TicketBooking, holderName: string, rollNumber?: string | null): void {
  const qrSrc = booking.qrCodeImage || "";
  const roll = rollNumber?.trim() || booking.rollNumber?.trim() || "—";
  const event = booking.event;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>MU Events Pass — ${event.title}</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #1a1a1a; color: #fff; padding: 24px; }
    .card { max-width: 420px; margin: 0 auto; background: linear-gradient(145deg, #1f1f1f, #2d2d2d); border-radius: 16px; padding: 24px; border: 1px solid #444; }
    h1 { font-size: 1.25rem; margin: 0 0 8px; }
    .meta { font-size: 0.85rem; opacity: 0.85; margin-bottom: 16px; }
    .qr { text-align: center; margin: 20px 0; }
    .qr img { width: 200px; height: 200px; background: #fff; padding: 8px; border-radius: 8px; }
    .roll { font-family: monospace; font-size: 1.1rem; font-weight: bold; text-align: center; }
    .label { font-size: 0.65rem; text-transform: uppercase; opacity: 0.6; margin-top: 12px; }
    .hint { font-size: 0.75rem; text-align: center; opacity: 0.7; margin-top: 8px; }
    @media print { body { background: #fff; color: #000; } .card { border: 2px solid #000; } }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size:0.65rem;text-transform:uppercase;letter-spacing:0.15em;color:#c9a227;font-weight:700;">MU Events Pass</div>
    <h1>${escapeHtml(event.title)}</h1>
    <div class="meta">
      ${escapeHtml(formatCalendarDateLong(event.eventDate))} · ${escapeHtml(event.eventTime)}<br/>
      ${escapeHtml(event.venue)}<br/>
      ${escapeHtml(event.collegeName || "")}
    </div>
    <div class="qr">${qrSrc ? `<img src="${qrSrc}" alt="Entry QR" />` : "<p>QR pending payment</p>"}</div>
    <p class="hint">Show this QR at the venue. Entry code is verified on scan only.</p>
    <div class="label">Roll number</div>
    <div class="roll">${escapeHtml(roll)}</div>
    <div class="label">Holder</div>
    <div>${escapeHtml(holderName)}</div>
    <div class="label">Status</div>
    <div>${escapeHtml(booking.status)}</div>
  </div>
  <script>window.onload = () => { window.print(); };</script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank", "noopener,noreferrer");
  if (!win) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `ticket-${roll.replace(/[^a-zA-Z0-9]/g, "_")}.html`;
    a.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
