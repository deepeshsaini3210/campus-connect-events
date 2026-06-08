import { GraduationCap, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { authService, AUTH_CHANGED_EVENT } from "@/lib/api/auth";
import { canAccessStudentDashboard } from "@/lib/auth/roles";

export function SiteFooter() {
  const [showStudentLinks, setShowStudentLinks] = useState(false);

  useEffect(() => {
    const update = () => {
      const role = authService.getCurrentUser()?.role;
      setShowStudentLinks(
        authService.isAuthenticated() && canAccessStudentDashboard(role),
      );
    };
    update();
    window.addEventListener(AUTH_CHANGED_EVENT, update);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, update);
  }, []);
  return (
    <footer className="bg-ink text-ink-foreground mt-auto shrink-0">
      <div className="container-page py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-md bg-gradient-to-br from-primary to-[oklch(0.45_0.15_35)] flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <div className="font-display text-base font-bold">Mandsaur University</div>
              <div className="text-[10px] tracking-[0.2em] uppercase opacity-70">Dream. Learn. Lead.</div>
            </div>
          </div>
          <p className="text-sm opacity-70 leading-relaxed">
            The official events discovery and booking portal for the MU community and our partner institutions across India.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-primary">Explore</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><Link to="/events" className="hover:text-primary">All Events</Link></li>
            <li><Link to="/calendar" className="hover:text-primary">Event Calendar</Link></li>
            <li><Link to="/events" className="hover:text-primary">Browse Events</Link></li>
            <li><Link to="/collaborate" className="hover:text-primary">Collaboration Portal</Link></li>
            {showStudentLinks ? (
              <li><Link to="/dashboard" className="hover:text-primary">My Bookings</Link></li>
            ) : null}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-primary">University</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><a href="#" className="hover:text-primary">About MU</a></li>
            <li><a href="#" className="hover:text-primary">Academics</a></li>
            <li><a href="#" className="hover:text-primary">Admissions</a></li>
            <li><a href="#" className="hover:text-primary">Placements</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-primary">Contact</h4>
          <ul className="space-y-3 text-sm opacity-80">
            <li className="flex gap-2"><MapPin className="h-4 w-4 mt-0.5 shrink-0" /> SH-31, Rewas Dewda Road, Mandsaur, MP 458001</li>
            <li className="flex gap-2"><Phone className="h-4 w-4 mt-0.5 shrink-0" /> +91 7422 297 200</li>
            <li className="flex gap-2"><Mail className="h-4 w-4 mt-0.5 shrink-0" /> events@meu.edu.in</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page py-5 flex flex-col md:flex-row items-center justify-between text-xs opacity-60 gap-2">
          <p>© 2026 Mandsaur University. All rights reserved.</p>
          <p>Privacy · Terms · Code of Conduct</p>
        </div>
      </div>
    </footer>
  );
}
