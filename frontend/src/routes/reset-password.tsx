import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth/AuthShell";
import { authService } from "@/lib/api/auth";

type Search = { token?: string };

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token: tokenFromUrl } = Route.useSearch();
  const [token, setToken] = useState(tokenFromUrl ?? "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (tokenFromUrl) setToken(tokenFromUrl);
  }, [tokenFromUrl]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await authService.resetPassword({ token: token.trim(), newPassword: password });
      if (res.success) {
        navigate({ to: "/login" });
        return;
      }
      setError(res.message || "Could not reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="New password" subtitle="Choose a strong password you haven’t used elsewhere.">
      <div className="bg-card border border-border rounded-2xl shadow-card p-6 sm:p-8">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-token">Reset token</Label>
            <Input
              id="reset-token"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste token from email / logs"
              className="h-11 font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Token is usually prefilled when you open the link from your inbox or backend logs.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="np">New password</Label>
            <Input
              id="np"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="npc">Confirm password</Label>
            <Input
              id="npc"
              type="password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="h-11"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Use upper & lower case, a number, and @ $ ! % * ? &
          </p>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating…
              </>
            ) : (
              "Update password"
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
