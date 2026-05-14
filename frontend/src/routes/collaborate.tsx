import { createFileRoute, Link } from "@tanstack/react-router";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useState } from "react";
import { Building2, Handshake, ArrowRight, CheckCircle2, GraduationCap, Sparkles } from "lucide-react";
import { partnerColleges, collaborationOffers } from "@/lib/events-data";
import { fetchCollaborationOffers, fetchPartnerColleges, submitCollaborationRequest } from "@/lib/api/public-content";
import { fetchColleges } from "@/lib/api/colleges";

export const Route = createFileRoute("/collaborate")({
  loader: async () => {
    try {
      const [partners, offers, colleges] = await Promise.all([
        fetchPartnerColleges(),
        fetchCollaborationOffers(),
        fetchColleges(),
      ]);
      return { partners, offers, colleges };
    } catch {
      return {
        partners: partnerColleges.map((p, i) => ({ id: i + 1, name: p.name, activeOffers: p.offers })),
        offers: collaborationOffers.map((o, i) => ({ collaborationId: i + 1, college: o.college, offer: o.offer, validity: o.validity })),
        colleges: partnerColleges.map((p, i) => ({ id: i + 1, name: p.name, code: p.name })),
      };
    }
  },
  head: () => ({ meta: [{ title: "Collaboration Portal — MU Events" }, { name: "description", content: "List your college's events on MU Events and collaborate with thousands of students." }] }),
  component: CollaboratePage,
});

function CollaboratePage() {
  const { partners, offers, colleges } = Route.useLoaderData();
  const firstId = colleges[0]?.id;
  const secondId = colleges[1]?.id ?? firstId;
  const [requesterCollegeId, setRequesterCollegeId] = useState(() => String(firstId ?? ""));
  const [partnerCollegeId, setPartnerCollegeId] = useState(() => String(secondId ?? firstId ?? ""));
  const [coordinatorName, setCoordinatorName] = useState("");
  const [coordinatorEmail, setCoordinatorEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [collabType, setCollabType] = useState("List our event on MU Events");
  const [notes, setNotes] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: any) {
    e.preventDefault();
    setStatusMessage(null);
    setLoading(true);
    try {
      await submitCollaborationRequest({
        requesterCollegeId: Number(requesterCollegeId),
        partnerCollegeId: Number(partnerCollegeId),
        coordinatorName,
        coordinatorEmail,
        notes: `Phone: ${phone}\nType: ${collabType}\n\n${notes}`,
      });
      setStatusMessage("Request submitted successfully. Our partnerships team will contact you soon.");
      setCoordinatorName("");
      setCoordinatorEmail("");
      setPhone("");
      setNotes("");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not submit request.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <RequireAuth>
      <section className="relative bg-ink text-ink-foreground py-20 overflow-hidden">
        <div className="absolute inset-0 hero-bg opacity-40" />
        <div className="relative container-page text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs uppercase tracking-widest font-medium mb-6">
            <Sparkles className="h-3.5 w-3.5 text-gold" /> For colleges & organizers
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-5 leading-tight max-w-4xl mx-auto">
            Collaborate with <span className="text-gradient-primary">Mandsaur University</span>
          </h1>
          <p className="opacity-80 max-w-2xl mx-auto text-lg mb-8">
            List your events on India's growing inter-university events network. Reach 18,000+ engaged students. Offer exclusive perks. Build lasting partnerships.
          </p>
          <Link to="/" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold hover:opacity-90">
            Start a collaboration <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page grid md:grid-cols-3 gap-6">
          {[
            { icon: Building2, title: "List Your Events", desc: "Publish your college events directly to thousands of MU students with verified institutional badges." },
            { icon: Handshake, title: "Reserve Special Slots", desc: "Offer discounted passes or reserved participation for MU students — we'll promote them across the portal." },
            { icon: GraduationCap, title: "Joint Initiatives", desc: "Co-host hackathons, fests and seminars with combined branding, prize pools and audiences." },
          ].map((b) => (
            <div key={b.title} className="bg-card border border-border rounded-2xl p-7 hover:shadow-elegant hover:border-primary/40 transition">
              <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                <b.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">{b.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-secondary/40">
        <div className="container-page">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">Already onboard</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Featured Partner Colleges</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {partners.length === 0 ? (
              <p className="col-span-full text-center text-sm text-muted-foreground py-8">
                No colleges in the directory yet. Seed the database or add colleges in admin.
              </p>
            ) : null}
            {partners.map((p) => (
              <div key={p.id} className="bg-card border border-border rounded-xl p-6 text-center">
                <div className="h-12 w-12 mx-auto rounded-full bg-gradient-to-br from-primary to-gold flex items-center justify-center mb-3">
                  <GraduationCap className="h-6 w-6 text-primary-foreground" />
                </div>
                <h4 className="font-semibold text-sm">{p.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">{p.activeOffers} offers live</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">Live offers</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Exclusive Collaboration Perks</h2>
            <p className="text-muted-foreground mb-6">Active discounts and reserved slots from partner institutions for MU students.</p>
            <div className="space-y-3">
              {offers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No approved collaboration offers yet. Approved rows with &quot;special offers&quot; text appear here from the database.
                </p>
              ) : null}
              {offers.map((o) => (
                <div key={o.collaborationId} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                        <h4 className="font-semibold text-sm">{o.college}</h4>
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{o.validity}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{o.offer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="bg-card border border-border rounded-2xl shadow-card p-7 lg:sticky lg:top-32">
            <h3 className="font-display text-2xl font-bold mb-1">Submit a collaboration request</h3>
            <p className="text-sm text-muted-foreground mb-6">Our partnerships team reviews requests within 3 working days.</p>
            <form className="space-y-4" onSubmit={onSubmit}>
              {colleges.length < 2 ? (
                <p className="text-xs text-amber-700 dark:text-amber-500">
                  Add at least two colleges in the database to submit a collaboration between institutions.
                </p>
              ) : null}
              <div>
                <label htmlFor="collab-requester" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your college *</label>
                <select id="collab-requester" value={requesterCollegeId} onChange={(e) => setRequesterCollegeId(e.target.value)} className="w-full mt-1.5 px-3 py-2.5 border border-input rounded-lg text-sm bg-background outline-none focus:border-primary" disabled={colleges.length === 0}>
                  {colleges.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="collab-partner" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Partner college *</label>
                <select id="collab-partner" value={partnerCollegeId} onChange={(e) => setPartnerCollegeId(e.target.value)} className="w-full mt-1.5 px-3 py-2.5 border border-input rounded-lg text-sm bg-background outline-none focus:border-primary" disabled={colleges.length === 0}>
                  {colleges.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="collab-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Coordinator name *</label>
                <input id="collab-name" required value={coordinatorName} onChange={(e) => setCoordinatorName(e.target.value)} placeholder="Dr. Ramesh Kumar" className="w-full mt-1.5 px-3 py-2.5 border border-input rounded-lg text-sm bg-background outline-none focus:border-primary" />
              </div>
              <div>
                <label htmlFor="collab-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Official email *</label>
                <input id="collab-email" required type="email" value={coordinatorEmail} onChange={(e) => setCoordinatorEmail(e.target.value)} placeholder="coordinator@college.edu" className="w-full mt-1.5 px-3 py-2.5 border border-input rounded-lg text-sm bg-background outline-none focus:border-primary" />
              </div>
              <div>
                <label htmlFor="collab-phone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone *</label>
                <input id="collab-phone" required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 …" className="w-full mt-1.5 px-3 py-2.5 border border-input rounded-lg text-sm bg-background outline-none focus:border-primary" />
              </div>
              <div>
                <label htmlFor="collab-type" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type of collaboration *</label>
                <select id="collab-type" value={collabType} onChange={(e) => setCollabType(e.target.value)} className="w-full mt-1.5 px-3 py-2.5 border border-input rounded-lg text-sm bg-background outline-none focus:border-primary">
                  <option>List our event on MU Events</option>
                  <option>Joint event / co-hosted hackathon</option>
                  <option>Reserved seats / special offer for MU students</option>
                  <option>Long-term partnership</option>
                </select>
              </div>
              <div>
                <label htmlFor="collab-notes" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tell us more</label>
                <textarea id="collab-notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Share details about your event, audience and goals…" className="w-full mt-1.5 px-3 py-2.5 border border-input rounded-lg text-sm bg-background outline-none focus:border-primary resize-none" />
              </div>
              {statusMessage ? <p className="text-xs text-muted-foreground">{statusMessage}</p> : null}
              <button
                type="submit"
                disabled={loading || colleges.length < 2}
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-lg font-bold hover:opacity-90 disabled:opacity-60"
              >
                {loading ? "Submitting..." : "Submit request"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </RequireAuth>
  );
}
