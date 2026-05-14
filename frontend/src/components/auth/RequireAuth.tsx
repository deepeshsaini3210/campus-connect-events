import { useLayoutEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { authService } from "@/lib/api/auth";

function redirectTarget(): string {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search}`;
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate({
        to: "/login",
        search: { redirect: redirectTarget() },
      });
      return;
    }
    setReady(true);
  }, [navigate]);

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-9 w-9 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  return <>{children}</>;
}
