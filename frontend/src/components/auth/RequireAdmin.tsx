import { useLayoutEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { authService } from "@/lib/api/auth";
import { ADMIN_CONSOLE_ROLES } from "@/lib/auth/roles";
import { postLoginPath } from "@/lib/auth/nav";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate({
        to: "/login",
        search: {
          redirect:
            typeof window !== "undefined"
              ? `${window.location.pathname}${window.location.search}`
              : "/admin",
        },
      });
      return;
    }
    const role = authService.getCurrentUser()?.role;
    if (!authService.hasAnyRole([...ADMIN_CONSOLE_ROLES])) {
      navigate({ to: postLoginPath(role) });
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
