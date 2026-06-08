import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth/AuthShell";
import { authService } from "@/lib/api/auth";

type Search = { token?: string; registered?: string };

function normalizeRegistered(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  return value.replace(/^"+|"+$/g, "").trim();
}

export const Route = createFileRoute("/verify-email")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    token: typeof search.token === "string" ? search.token : undefined,
    registered: normalizeRegistered(search.registered),
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { token: tokenFromUrl, registered } = Route.useSearch();
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">(
    tokenFromUrl ? "loading" : "idle",
  );
  const [message, setMessage] = useState("");

  const pendingSignup = registered === "1" || registered === "true";

  useEffect(() => {
    if (!tokenFromUrl) return;
    let cancelled = false;
    (async () => {
      const res = await authService.verifyEmailToken(tokenFromUrl);
      if (cancelled) return;
      if (res.success) {
        setStatus("ok");
        setMessage("Your email is verified. You can sign in now.");
      } else {
        setStatus("err");
        setMessage(res.message || "This verification link is invalid or has expired.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tokenFromUrl]);

  if (pendingSignup && !tokenFromUrl) {
    return (
      <AuthShell
        title="Check your email"
        subtitle="We sent you a verification link. Open it to activate your account."
      >
        <div className="bg-card border border-border rounded-2xl shadow-card p-6 sm:p-8 space-y-6 text-center">
          <Mail className="mx-auto h-14 w-14 text-primary" />
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Verification email has been sent. Please check your inbox (and spam folder) and click
              the link to complete registration.
            </p>
            <p className="text-xs text-muted-foreground">
              Your account is not active until you verify your email. After verifying, sign in with
              your password.
            </p>
          </div>
          <div className="border-t border-border pt-6 space-y-3">
            <p className="text-xs text-muted-foreground">Didn’t receive the email?</p>
            <ResendBlock />
          </div>
          <Button className="w-full h-11 font-semibold" variant="outline" asChild>
            <Link to="/login">Back to sign in</Link>
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={status === "ok" ? "Email verified" : "Verify email"}
      subtitle={
        tokenFromUrl
          ? "Confirming your email from the link…"
          : "Open the verification link we sent to your email."
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
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        ) : null}

        {status === "err" ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-2 text-center">
              <XCircle className="h-12 w-12 text-destructive" />
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
            <ResendBlock />
          </div>
        ) : null}

        {!tokenFromUrl && status === "idle" ? (
          <div className="text-center space-y-4 py-2">
            <Mail className="mx-auto h-12 w-12 text-primary" />
            <p className="text-sm text-muted-foreground">
              Use the link in your verification email. If it expired, request a new one below.
            </p>
            <ResendBlock />
          </div>
        ) : null}

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
        A new verification link was sent. Check your inbox.
      </p>
    );
  }

  return (
    <form onSubmit={send} className="flex flex-col sm:flex-row gap-2">
      <div className="space-y-2 flex-1 text-left">
        <Label htmlFor="resend-email" className="sr-only">
          Email
        </Label>
        <Input
          id="resend-email"
          type="email"
          required
          placeholder="Your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11"
        />
      </div>
      <Button type="submit" variant="secondary" className="h-11 shrink-0" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Resend link"}
      </Button>
      {err ? <p className="text-sm text-destructive w-full">{err}</p> : null}
    </form>
  );
}
