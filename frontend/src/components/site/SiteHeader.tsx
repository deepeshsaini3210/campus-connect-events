import { Link, useNavigate } from "@tanstack/react-router";
import { GraduationCap, Search, Menu, X, Facebook, Twitter, Instagram, Youtube, Linkedin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { authService, AUTH_CHANGED_EVENT } from "@/lib/api/auth";
import { ADMIN_ROLES } from "@/lib/auth/roles";

const publicNav = [
  { to: "/", label: "Home" },
  { to: "/events", label: "Events" },
  { to: "/calendar", label: "Calendar" },
  { to: "/gallery", label: "Gallery" },
  { to: "/collaborate", label: "Collaborate" },
] as const;

export function SiteHeader() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [authTick, setAuthTick] = useState(0);
  /** Avoid hydration mismatch: server has no localStorage; client must match server on first paint. */
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    setAuthReady(true);
    const onAuth = () => setAuthTick((t) => t + 1);
    window.addEventListener(AUTH_CHANGED_EVENT, onAuth);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, onAuth);
  }, []);

  const isAuthenticated = authReady && authService.isAuthenticated();

  const nav = useMemo(() => {
    const items: { to: string; label: string }[] = [...publicNav];
    if (!authReady) return items;
    if (authService.isAuthenticated()) {
      items.push({ to: "/dashboard", label: "Student Dashboard" });
    }
    if (authService.hasAnyRole([...ADMIN_ROLES])) {
      items.push({ to: "/admin", label: "Admin" });
    }
    return items;
  }, [authTick, authReady]);

  async function onSignOut() {
    await authService.logout();
    navigate({ to: "/" });
    setOpen(false);
  }
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      {/* Top utility bar */}
      <div className="bg-ink text-ink-foreground text-xs">
        <div className="container-page flex items-center justify-between h-9">
          <div className="hidden md:flex items-center gap-5 uppercase tracking-wider">
            <a href="#" className="hover:text-primary transition-colors">PHD Programme</a>
            <a href="#" className="hover:text-primary transition-colors">Research</a>
            <a href="#" className="hover:text-primary transition-colors">Alumni</a>
            <a href="#" className="hover:text-primary transition-colors">NIRF</a>
            <a href="#" className="hover:text-primary transition-colors">Career</a>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            {[Facebook, Twitter, Instagram, Youtube, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="opacity-70 hover:opacity-100 transition-opacity"><Icon className="h-3.5 w-3.5" /></a>
            ))}
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="container-page flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-12 w-12 rounded-md bg-gradient-to-br from-primary to-[oklch(0.45_0.15_35)] flex items-center justify-center shadow-card">
            <GraduationCap className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg font-bold text-foreground">Mandsaur University</div>
            <div className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">Events Portal · Dream. Learn. Lead.</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors rounded-md"
              activeProps={{ className: "px-3 py-2 text-sm font-semibold text-primary rounded-md bg-accent" }}
            >
              {n.label}
            </Link>
          ))}
          <button className="ml-1 p-2 hover:bg-accent rounded-md transition-colors" aria-label="Search">
            <Search className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 ml-3 pl-3 border-l border-border">
            {isAuthenticated ? (
              <Button variant="outline" size="sm" className="font-semibold" type="button" onClick={() => void onSignOut()}>
                Sign out
              </Button>
            ) : (
              <>
                <Button variant="outline" size="sm" className="font-semibold" asChild>
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button size="sm" className="font-semibold" asChild>
                  <Link to="/register">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </nav>

        <button type="button" className="lg:hidden p-2 rounded-md hover:bg-accent transition-colors" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Open menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="container-page py-3 flex flex-col">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="py-2.5 text-sm font-medium border-b border-border last:border-0">
                {n.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-border">
              {isAuthenticated ? (
                <Button variant="outline" className="w-full font-semibold" type="button" onClick={() => void onSignOut()}>
                  Sign out
                </Button>
              ) : (
                <>
                  <Button variant="outline" className="w-full font-semibold" asChild>
                    <Link to="/login" onClick={() => setOpen(false)}>
                      Sign in
                    </Link>
                  </Button>
                  <Button className="w-full font-semibold" asChild>
                    <Link to="/register" onClick={() => setOpen(false)}>
                      Sign up
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Latest updates ticker */}
      <div className="bg-primary text-primary-foreground">
        <div className="container-page flex items-center gap-4 h-10 overflow-hidden">
          <span className="font-bold text-xs uppercase tracking-widest shrink-0">Latest:</span>
          <span className="text-sm truncate">Registrations open for InnovateX 2026 Hackathon · Sanskriti Cultural Fest tickets live · Mega Placement Drive on June 8</span>
        </div>
      </div>
    </header>
  );
}
