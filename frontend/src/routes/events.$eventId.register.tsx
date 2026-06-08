import { createFileRoute, Link } from "@tanstack/react-router";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useState } from "react";
import { CheckCircle2, ArrowLeft, Download, Calendar, MapPin, Loader2, AlertCircle } from "lucide-react";
import type { CollegeEvent } from "@/lib/events-data";
import { fetchEventById } from "@/lib/api/events";
import { completeBookingPayment, createBooking, type CreateBookingResult } from "@/lib/api/bookings";
import { downloadEventTicket } from "@/lib/ticket-download";
import { authService } from "@/lib/api/auth";
import { formatCalendarDateLong } from "@/lib/format-calendar-date";

export const Route = createFileRoute("/events/$eventId/register")({
  loader: async ({ params }) => {
    const event = await fetchEventById(params.eventId);
    return { event };
  },
  component: RegisterPage,
});

function parseNumericEventId(id: string): number | null {
  const n = Number(id);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function RegisterPage() {
  const { event } = Route.useLoaderData() as { event: CollegeEvent };
  const user = authService.getCurrentUser();
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || "Student";

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<CreateBookingResult | null>(null);
  const [rollNumber, setRollNumber] = useState(user?.rollNumber?.trim() ?? "");

  const numericEventId = parseNumericEventId(event.id);
  const ticketRoll = booking?.rollNumber?.trim() || rollNumber.trim() || "—";

  async function handleRegister() {
    if (!numericEventId) {
      setError("Invalid event. Open an event from the events list and try again.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      let result = await createBooking(numericEventId, rollNumber);
      if (event.fee > 0) {
        result = await completeBookingPayment(result.id);
      }
      setBooking(result);
      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <RequireAuth>
    <section className="py-12 bg-secondary/30 min-h-[80vh]">
      <div className="container-page max-w-3xl">
        <Link to="/events/$eventId" params={{ eventId: event.id }} className="text-sm text-primary font-semibold mb-6 inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to event
        </Link>

        <div className="flex items-center justify-between mb-8">
          {["Details", "Payment", "Confirmation"].map((label, i) => {
            const n = (i + 1) as 1 | 2 | 3;
            const active = step === n;
            const done = step > n;
            return (
              <div key={label} className="flex items-center flex-1">
                <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold border-2 ${done ? "bg-success text-white border-success" : active ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground"}`}>
                  {done ? <CheckCircle2 className="h-5 w-5" /> : n}
                </div>
                <span className={`ml-2 text-xs font-semibold uppercase tracking-wider ${active || done ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
                {i < 2 && <div className={`flex-1 h-0.5 mx-3 ${done ? "bg-success" : "bg-border"}`} />}
              </div>
            );
          })}
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-card p-8">
          {error ? (
            <div className="mb-6 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive" role="alert">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          ) : null}

          {step === 1 && (
            <>
              <h1 className="font-display text-2xl font-bold mb-1">Your details</h1>
              <p className="text-sm text-muted-foreground mb-6">Registering for <span className="font-semibold text-foreground">{event.title}</span></p>
              <form
                className="grid md:grid-cols-2 gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (event.fee === 0) {
                    void handleRegister();
                  } else {
                    setStep(2);
                  }
                }}
              >
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name *</label>
                  <input
                    required
                    readOnly
                    defaultValue={displayName}
                    className="w-full mt-1.5 px-3 py-2.5 border border-input rounded-lg text-sm bg-muted/40 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Roll number *</label>
                  <input
                    required
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="MU2023BTCS001"
                    className="w-full mt-1.5 px-3 py-2.5 border border-input rounded-lg text-sm bg-background outline-none focus:border-primary font-mono"
                  />
                </div>
                {[
                  { label: "Email", placeholder: user?.email || "you@meu.edu.in", type: "email", defaultValue: user?.email || "" },
                  { label: "Phone", placeholder: "+91 98765 43210", type: "tel" },
                  { label: "Department", placeholder: "Computer Science" },
                  { label: "Year of Study", placeholder: "3rd Year" },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{f.label} *</label>
                    <input
                      required
                      type={f.type ?? "text"}
                      placeholder={f.placeholder}
                      defaultValue={f.defaultValue}
                      className="w-full mt-1.5 px-3 py-2.5 border border-input rounded-lg text-sm bg-background outline-none focus:border-primary"
                    />
                  </div>
                ))}
                <div className="md:col-span-2 flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-60"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {event.fee === 0 ? "Confirm registration" : "Continue to payment"}
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="font-display text-2xl font-bold mb-1">Payment</h1>
              <p className="text-sm text-muted-foreground mb-6">Secure your seat — ₹{event.fee}</p>
              <div className="space-y-3 mb-6">
                {["UPI / GPay / PhonePe", "Credit / Debit Card", "Net Banking", "MU Student Wallet"].map((m, i) => (
                  <label key={m} className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:border-primary">
                    <input type="radio" name="pay" defaultChecked={i === 0} className="accent-primary" />
                    <span className="font-medium text-sm">{m}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-between items-center bg-secondary/50 rounded-lg p-4 mb-6">
                <span className="font-semibold">Total</span>
                <span className="font-display font-bold text-2xl text-primary">₹{event.fee}</span>
              </div>
              <button
                type="button"
                onClick={() => void handleRegister()}
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3.5 rounded-lg font-bold hover:opacity-90 disabled:opacity-60"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Pay ₹{event.fee} & Confirm
              </button>
            </>
          )}

          {step === 3 && (
            <div className="text-center py-6">
              <div className="h-20 w-20 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
              <h1 className="font-display text-3xl font-bold mb-2">You're in!</h1>
              <p className="text-muted-foreground mb-8">Your registration for <span className="font-semibold text-foreground">{event.title}</span> is confirmed.</p>

              <div className="bg-gradient-to-br from-ink to-[oklch(0.20_0.03_40)] text-ink-foreground rounded-2xl p-6 max-w-md mx-auto text-left shadow-elegant">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[10px] uppercase tracking-widest text-gold font-bold">MU Events Pass</div>
                  <div className="text-[10px] uppercase tracking-widest opacity-60">{event.category}</div>
                </div>
                <h3 className="font-display text-xl font-bold mb-3 leading-tight">{event.title}</h3>
                <div className="space-y-1 text-xs opacity-90 mb-5">
                  <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> {formatCalendarDateLong(event.date)} · {event.time}</div>
                  <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> {event.venue}</div>
                </div>
                <div className="border-t border-dashed border-white/20 pt-4 flex items-center gap-4">
                  {booking?.qrCodeImage ? (
                    <img src={booking.qrCodeImage} alt="Entry QR code" className="h-28 w-28 bg-white p-2 rounded-md shrink-0" />
                  ) : (
                    <div className="h-28 w-28 bg-white/10 rounded-md flex items-center justify-center text-xs opacity-60">QR pending</div>
                  )}
                  <div>
                    <div className="text-[10px] uppercase tracking-widest opacity-60">Roll number</div>
                    <div className="font-mono text-sm font-bold">{ticketRoll}</div>
                    <div className="text-[10px] uppercase tracking-widest opacity-60 mt-2">Holder</div>
                    <div className="text-sm font-semibold">{displayName}</div>
                    <p className="text-[10px] opacity-70 mt-2">Entry code is inside the QR — scanned at the gate only</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-center mt-8">
                <button
                  type="button"
                  disabled={!booking?.qrCodeImage}
                  onClick={() => booking && downloadEventTicket(booking, displayName, ticketRoll)}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
                >
                  <Download className="h-4 w-4" /> Download Ticket
                </button>
                <Link to="/dashboard" className="inline-flex items-center gap-2 border border-input px-6 py-3 rounded-lg font-semibold hover:bg-secondary">
                  Go to my dashboard
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
    </RequireAuth>
  );
}
