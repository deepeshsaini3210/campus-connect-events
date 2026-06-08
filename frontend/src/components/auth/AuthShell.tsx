import { Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import heroImg from "@/assets/hero-events.jpg";

type Props = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

/**
 * Shared layout for auth flows — matches portal branding (orange / ink / serif headings).
 */
export function AuthShell({ title, subtitle, children }: Props) {
  return (
    <div className="flex-1 grid lg:grid-cols-2 min-h-0">
      <div className="relative hidden lg:block overflow-hidden">
        <img src={heroImg} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-ink/95 via-primary/40 to-ink/90" />
        <div className="relative flex h-full min-h-[560px] flex-col justify-between p-12 text-ink-foreground">
          <Link to="/" className="inline-flex items-center gap-3 group w-fit">
            <div className="h-11 w-11 rounded-md bg-white/15 backdrop-blur flex items-center justify-center ring-1 ring-white/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <div className="font-display text-lg font-bold">Mandsaur University</div>
              <div className="text-[10px] tracking-[0.2em] uppercase opacity-80">Events Portal</div>
            </div>
          </Link>
          <div className="max-w-md space-y-4">
            <p className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
              Official gateway
            </p>
            <h2 className="font-display text-3xl xl:text-4xl font-bold leading-tight">
              Discover events. Book seats. Grow with MU.
            </h2>
            <p className="text-sm leading-relaxed text-white/85">
              One secure account for registrations, collaborations, and campus updates — aligned
              with our university identity.
            </p>
          </div>
          <p className="text-xs opacity-60">© {new Date().getFullYear()} Mandsaur University</p>
        </div>
      </div>

      <div className="flex flex-col justify-center px-4 py-12 sm:px-8 lg:px-12 bg-background">
        <div className="mx-auto w-full max-w-md">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            ← Back to home
          </Link>
          <div className="flex items-center gap-3 mb-6 lg:hidden">
            <div className="h-11 w-11 rounded-md bg-gradient-to-br from-primary to-[oklch(0.45_0.15_35)] flex items-center justify-center shadow-card shrink-0">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                MU Events
              </p>
              <h1 className="font-display text-xl font-bold">{title}</h1>
            </div>
          </div>
          <div className="hidden lg:block mb-2">
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">
              MU Events
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
            <p className="mt-2 text-muted-foreground text-sm">{subtitle}</p>
          </div>
          <div className="lg:hidden mb-6">
            <p className="text-muted-foreground text-sm">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
