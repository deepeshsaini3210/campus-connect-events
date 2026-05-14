import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth/AuthShell";
import { authService } from "@/lib/api/auth";

type Search = { token?: string; registered?: string };

export const Route = createFileRoute("/verify-email")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    token: typeof search.token === "string" ? search.token : undefined,
    registered: typeof search.registered === "string" ? search.registered : undefined,
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { token: tokenFromUrl, registered } = Route.useSearch();
  const [token, setToken] = useState(tokenFromUrl ?? "");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">(
    tokenFromUrl ? "loading" : "idle",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!tokenFromUrl) return;
    let cancelled = false;
    (async () => {
      const res = await authService.verifyEmailToken(tokenFromUrl);
      if (cancelled) return;
      if (res.success) {
        authService.patchCurrentUser({ emailVerified: true });
        setStatus("ok");
        setMessage("Your email is verified. You can use all portal features.");
      } else {
        setStatus("err");
        setMessage(res.message || "Verification failed.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tokenFromUrl]);

  async function verifyManual(e: React.FormEvent) {
    e.preventDefault();
    if (!token.trim()) return;
    setStatus("loading");
    setMessage("");
    const res = await authService.verifyEmailToken(token.trim());
    if (res.success) {
      authService.patchCurrentUser({ emailVerified: true });
      setStatus("ok");
      setMessage("Your email is verified.");
    } else {
      setStatus("err");
      setMessage(res.message || "Verification failed.");
    }
  }

  const showRegisteredHint = registered === "1";

  return (
    <AuthShell
      title="Verify email"
      subtitle={
        showRegisteredHint
          ? "Account created — confirm your email using the link we sent (see backend logs in development)."
          : "Confirm your university email to activate your profile."
      }
    >
      <div className="bg-card border border-border rounded-2xl shadow-card p-6 sm:p-8 space-y-6">
        {tokenFromUrl && status === "loading" ? (
          <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm">Verifying your link…</p>
          </div>
        ) : null}

        {status === "ok" ? (
          <div className="text-center space-y-4 py-2">
            <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
            <p className="text-sm text-muted-foreground">{message}</p>
            <Button className="w-full h-11 font-semibold" asChild>
              <Link to="/dashboard">Go to dashboard</Link>
            </Button>
          </div>
        ) : null}

        {status === "err" ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-2 text-center">
              <XCircle className="h-12 w-12 text-destructive" />
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
            <form onSubmit={verifyManual} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="manual-token">Paste verification token</Label>
                <Input
                  id="manual-token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Token from email / logs"
                  className="font-mono text-xs h-11"
                />
              </div>
              <Button type="submit" variant="outline" className="w-full">
                Try again
              </Button>
            </form>
          </div>
        ) : null}

        {!tokenFromUrl && status === "idle" ? (
          <form onSubmit={verifyManual} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vt">Verification token</Label>
              <Input
                id="vt"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste from email or backend log line"
                className="font-mono text-xs h-11"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 font-semibold"
              disabled={status === "loading"}
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                "Verify"
              )}
            </Button>
          </form>
        ) : null}

        <div className="border-t border-border pt-6 space-y-3">
          <p className="text-xs text-muted-foreground text-center">
            Didn’t get the email? Request a new verification link.
          </p>
          <ResendBlock />
        </div>

        <p className="text-center text-sm">
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

function ResendBlock() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const res = await authService.resendVerification(email.trim());
    setLoading(false);
    if (res.success) {
      setSent(true);
      return;
    }
    setErr(res.message || "Could not resend.");
  }

  if (sent) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Check your inbox (or logs) for the new link.
      </p>
    );
  }

  return (
    <form onSubmit={send} className="flex flex-col sm:flex-row gap-2">
      <Input
        type="email"
        required
        placeholder="Your registered email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-11 flex-1"
      />
      <Button type="submit" variant="secondary" className="h-11 shrink-0" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Resend"}
      </Button>
      {err ? <p className="text-sm text-destructive w-full sm:col-span-2">{err}</p> : null}
    </form>
  );
}
