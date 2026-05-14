import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useState } from "react";
import { CheckCircle2, ArrowLeft, Download, Calendar, MapPin } from "lucide-react";
import { events, type CollegeEvent } from "@/lib/events-data";
import { fetchEventById } from "@/lib/api/events";
import { formatCalendarDateLong } from "@/lib/format-calendar-date";

export const Route = createFileRoute("/events/$eventId/register")({
  loader: async ({ params }) => {
    try {
      const event = await fetchEventById(params.eventId);
      return { event };
    } catch {
      const fallbackEvent = events.find(e => e.id === params.eventId);
      if (!fallbackEvent) throw notFound();
      return { event: fallbackEvent };
    }
  },
  component: RegisterPage,
});

function ticketSuffixFromEventId(id: string): string {
  const digits = id.replace(/\D/g, "");
  const tail = digits.slice(-6).padStart(6, "0");
  return tail.length >= 6 ? tail.slice(-6) : "000001";
}

function RegisterPage() {
  const { event } = Route.useLoaderData() as { event: CollegeEvent };
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const ticketId = `MU-${event.id.toUpperCase()}-${ticketSuffixFromEventId(event.id)}`;

  return (
    <RequireAuth>
    <section className="py-12 bg-secondary/30 min-h-[80vh]">
      <div className="container-page max-w-3xl">
        <Link to="/events/$eventId" params={{ eventId: event.id }} className="text-sm text-primary font-semibold mb-6 inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to event
        </Link>

        {/* Stepper */}
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
          {step === 1 && (
            <>
              <h1 className="font-display text-2xl font-bold mb-1">Your details</h1>
              <p className="text-sm text-muted-foreground mb-6">Registering for <span className="font-semibold text-foreground">{event.title}</span></p>
              <form className="grid md:grid-cols-2 gap-4" onSubmit={(e) => { e.preventDefault(); setStep(event.fee === 0 ? 3 : 2); }}>
                {[
                  { label: "Full Name", placeholder: "Aarav Sharma" },
                  { label: "Enrollment ID", placeholder: "MU2023BTCS001" },
                  { label: "Email", placeholder: "you@meu.edu.in", type: "email" },
                  { label: "Phone", placeholder: "+91 98765 43210", type: "tel" },
                  { label: "Department", placeholder: "Computer Science" },
                  { label: "Year of Study", placeholder: "3rd Year" },
                ].map((f) => (
                  <div key={f.label} className={f.label === "Department" || f.label === "Year of Study" ? "" : ""}>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{f.label} *</label>
                    <input required type={f.type ?? "text"} placeholder={f.placeholder} className="w-full mt-1.5 px-3 py-2.5 border border-input rounded-lg text-sm bg-background outline-none focus:border-primary" />
                  </div>
                ))}
                <div className="md:col-span-2 flex justify-end mt-2">
                  <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:opacity-90">
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
              <button onClick={() => setStep(3)} className="w-full bg-primary text-primary-foreground py-3.5 rounded-lg font-bold hover:opacity-90">
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

              {/* Ticket */}
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
                  <div className="h-24 w-24 bg-white p-2 rounded-md grid grid-cols-8 gap-px">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div key={i} className={`${(i * 7 + i % 3) % 3 === 0 ? "bg-ink" : "bg-white"}`} />
                    ))}
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest opacity-60">Ticket ID</div>
                    <div className="font-mono text-sm font-bold">{ticketId}</div>
                    <div className="text-[10px] uppercase tracking-widest opacity-60 mt-2">Holder</div>
                    <div className="text-sm font-semibold">Aarav Sharma</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-center mt-8">
                <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90">
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
