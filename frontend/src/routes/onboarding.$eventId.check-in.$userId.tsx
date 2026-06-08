import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { RequireOnboarding } from "@/components/auth/RequireOnboarding";
import { checkInAttendee, fetchEventRegistrants, type CheckInResult, type Registrant } from "@/lib/api/onboarding";
import { Html5Qrcode } from "html5-qrcode";
import { ArrowLeft, Loader2, ScanLine, CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/onboarding/$eventId/check-in/$userId")({
  component: CheckInPage,
});

function CheckInPage() {
  const { eventId, userId } = Route.useParams();
  const numericEventId = Number(eventId);
  const numericUserId = Number(userId);
  const [attendee, setAttendee] = useState<Registrant | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [manualCode, setManualCode] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerDivId = "qr-reader";

  useEffect(() => {
    void (async () => {
      try {
        const list = await fetchEventRegistrants(numericEventId);
        setAttendee(list.find((r) => r.userId === numericUserId) ?? null);
      } catch {
        setAttendee(null);
      }
    })();
    return () => {
      void stopScanner();
    };
  }, [numericEventId, numericUserId]);

  async function stopScanner() {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch {
        /* ignore */
      }
      scannerRef.current = null;
    }
    setScanning(false);
  }

  async function startScanner() {
    setResult(null);
    await stopScanner();
    const scanner = new Html5Qrcode(scannerDivId);
    scannerRef.current = scanner;
    setScanning(true);
    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (decoded) => {
          await stopScanner();
          await runCheckIn(decoded);
        },
        () => {},
      );
    } catch {
      setScanning(false);
      setResult({
        allowed: false,
        alreadyEntered: false,
        message: "Could not access camera. Use manual entry code below.",
      });
    }
  }

  async function runCheckIn(payload: string) {
    try {
      const res = await checkInAttendee({
        userId: numericUserId,
        eventId: numericEventId,
        scannedPayload: payload,
      });
      setResult(res);
    } catch (e) {
      setResult({
        allowed: false,
        alreadyEntered: false,
        message: e instanceof Error ? e.message : "Check-in failed",
      });
    }
  }

  return (
    <RequireOnboarding>
      <section className="py-10 bg-secondary/30 min-h-screen">
        <div className="container-page max-w-lg">
          <Link
            to="/onboarding/$eventId"
            params={{ eventId }}
            className="text-sm text-primary font-semibold inline-flex items-center gap-1 mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back to list
          </Link>

          <h1 className="font-display text-2xl font-bold mb-1">Scan entry pass</h1>
          {attendee ? (
            <p className="text-sm text-muted-foreground mb-6">
              {attendee.fullName}
              {attendee.rollNumber ? ` · Roll ${attendee.rollNumber}` : ""}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mb-6">Attendee not found</p>
          )}

          <div id={scannerDivId} className={`rounded-xl overflow-hidden bg-black min-h-[240px] ${scanning ? "" : "hidden"}`} />

          {!scanning ? (
            <button
              type="button"
              onClick={() => void startScanner()}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-xl font-bold mb-4"
            >
              <ScanLine className="h-5 w-5" /> Start QR scanner
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void stopScanner()}
              className="w-full py-3 rounded-xl border border-border mb-4 text-sm font-semibold"
            >
              Stop scanner
            </button>
          )}

          <div className="bg-card border border-border rounded-xl p-4 mb-4">
            <p className="text-xs text-muted-foreground mb-2">Or paste entry code from QR</p>
            <div className="flex gap-2">
              <input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="MU-ENTRY:BK…"
                className="flex-1 px-3 py-2 border border-input rounded-lg text-sm font-mono"
              />
              <button
                type="button"
                onClick={() => void runCheckIn(manualCode)}
                className="px-4 py-2 bg-secondary rounded-lg text-sm font-semibold"
              >
                Verify
              </button>
            </div>
          </div>

          {result ? (
            <div
              className={`rounded-xl p-6 border ${
                result.allowed
                  ? "bg-success/15 border-success text-success"
                  : "bg-destructive/10 border-destructive/40 text-destructive"
              }`}
            >
              <div className="flex items-start gap-3">
                {result.allowed ? <CheckCircle2 className="h-8 w-8 shrink-0" /> : <XCircle className="h-8 w-8 shrink-0" />}
                <div>
                  <p className="font-bold text-lg">{result.message}</p>
                  {result.attendeeName ? <p className="text-sm mt-1 opacity-90">{result.attendeeName}</p> : null}
                  {result.rollNumber ? <p className="text-sm font-mono">Roll: {result.rollNumber}</p> : null}
                  {result.alreadyEntered ? (
                    <p className="text-xs mt-2">This pass was already used — no re-entry allowed.</p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </RequireOnboarding>
  );
}
