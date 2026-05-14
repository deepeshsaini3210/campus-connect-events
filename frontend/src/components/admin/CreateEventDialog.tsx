import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { createEvent, type CreateEventPayload, uploadEventImage } from "@/lib/api/events";
import { Loader2 } from "lucide-react";

const CATEGORIES: { id: number; name: string }[] = [
  { id: 1, name: "Technical" },
  { id: 2, name: "Cultural" },
  { id: 3, name: "Sports" },
  { id: 4, name: "Workshop" },
  { id: 5, name: "Seminar" },
  { id: 6, name: "Hackathon" },
  { id: 7, name: "Fest" },
  { id: 8, name: "Placement" },
  { id: 9, name: "Competition" },
];

function isoDatePlusDays(daysFromToday: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + daysFromToday);
  return d.toISOString().slice(0, 10);
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
};

export function CreateEventDialog({ open, onOpenChange, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(1);
  const [eventDate, setEventDate] = useState(isoDatePlusDays(14));
  const [eventTime, setEventTime] = useState("10:00");
  const [venue, setVenue] = useState("Main Auditorium, Mandsaur University");
  const [mode, setMode] = useState<CreateEventPayload["mode"]>("OFFLINE");
  const [fee, setFee] = useState("0");
  const [seatsTotal, setSeatsTotal] = useState("100");
  const [deadline, setDeadline] = useState(isoDatePlusDays(7));
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPartnerEvent, setIsPartnerEvent] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [highlightsText, setHighlightsText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasToken =
    typeof globalThis !== "undefined" &&
    "localStorage" in globalThis &&
    !!globalThis.localStorage.getItem("token");

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setDescription("");
    setCategoryId(1);
    setEventDate(isoDatePlusDays(14));
    setEventTime("10:00");
    setVenue("Main Auditorium, Mandsaur University");
    setMode("OFFLINE");
    setFee("0");
    setSeatsTotal("100");
    setDeadline(isoDatePlusDays(7));
    setIsFeatured(false);
    setIsPartnerEvent(false);
    setImageUrl("");
    setImageUploading(false);
    setHighlightsText("");
    setError("");
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (title.trim().length < 5) {
      setError("Title must be at least 5 characters.");
      return;
    }
    if (description.trim().length < 20) {
      setError("Description must be at least 20 characters.");
      return;
    }
    if (venue.trim().length < 5) {
      setError("Venue must be at least 5 characters.");
      return;
    }
    const highlights = highlightsText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 5);
    const payload: CreateEventPayload = {
      title: title.trim(),
      description: description.trim(),
      categoryId,
      eventDate,
      eventTime,
      venue: venue.trim(),
      mode,
      fee: Number(fee),
      seatsTotal: Math.max(1, Math.min(10000, Number.parseInt(seatsTotal, 10) || 1)),
      deadline,
      isFeatured,
      isPartnerEvent,
      imageUrl: imageUrl.trim() || undefined,
      highlights: highlights.length ? highlights : undefined,
    };
    setLoading(true);
    try {
      await createEvent(payload);
      onCreated();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Create event</DialogTitle>
          <DialogDescription>
            New events are saved as drafts in the backend. Sign in as College Admin, Event Organizer, or Super Admin to
            submit this form.
          </DialogDescription>
        </DialogHeader>

        {!hasToken ? (
          <p className="text-sm text-muted-foreground rounded-lg border border-border bg-secondary/40 p-4">
            You are not signed in.{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>{" "}
            first, then open this form again.
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ce-title">Title</Label>
            <Input id="ce-title" value={title} onChange={(e) => setTitle(e.target.value)} required minLength={5} maxLength={255} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ce-desc">Description (min 20 characters)</Label>
            <Textarea
              id="ce-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={20}
              maxLength={2000}
              rows={4}
              className="resize-y"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ce-cat">Category</Label>
              <select
                id="ce-cat"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ce-mode">Mode</Label>
              <select
                id="ce-mode"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={mode}
                onChange={(e) => setMode(e.target.value as CreateEventPayload["mode"])}
              >
                <option value="OFFLINE">Offline</option>
                <option value="ONLINE">Online</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ce-date">Event date</Label>
              <Input id="ce-date" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ce-time">Event time (24h)</Label>
              <Input id="ce-time" type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ce-venue">Venue</Label>
            <Input id="ce-venue" value={venue} onChange={(e) => setVenue(e.target.value)} required minLength={5} />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ce-fee">Fee (₹)</Label>
              <Input id="ce-fee" type="number" min={0} step="0.01" value={fee} onChange={(e) => setFee(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ce-seats">Total seats</Label>
              <Input id="ce-seats" type="number" min={1} max={10000} value={seatsTotal} onChange={(e) => setSeatsTotal(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ce-deadline">Registration deadline</Label>
              <Input id="ce-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ce-img-file">Event poster (MinIO upload)</Label>
            <Input
              id="ce-img-file"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={!hasToken || imageUploading}
              onChange={async (e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (!f) return;
                setError("");
                setImageUploading(true);
                try {
                  const url = await uploadEventImage(f);
                  setImageUrl(url);
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Image upload failed.");
                } finally {
                  setImageUploading(false);
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              JPEG, PNG, WebP or GIF, max 5 MB. Requires MinIO running and{" "}
              <code className="text-xs">minio.enabled=true</code> on the server.
            </p>
            {imageUrl ? (
              <div className="flex items-center gap-3 rounded-lg border border-border p-2 bg-secondary/30">
                <img src={imageUrl} alt="Poster preview" className="h-16 w-24 rounded object-cover" />
                <span className="text-xs text-muted-foreground break-all flex-1">{imageUrl}</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => setImageUrl("")}>
                  Clear
                </Button>
              </div>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="ce-img">Or paste image URL (optional)</Label>
            <Input id="ce-img" type="url" placeholder="https://…" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ce-high">Highlights (optional, max 5 lines)</Label>
            <Textarea
              id="ce-high"
              rows={3}
              placeholder={"One highlight per line\ne.g. Prize pool ₹50,000"}
              value={highlightsText}
              onChange={(e) => setHighlightsText(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center space-x-2">
              <Checkbox id="ce-feat" checked={isFeatured} onCheckedChange={(v) => setIsFeatured(v === true)} />
              <Label htmlFor="ce-feat" className="text-sm font-normal cursor-pointer">
                Featured on portal
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="ce-part" checked={isPartnerEvent} onCheckedChange={(v) => setIsPartnerEvent(v === true)} />
              <Label htmlFor="ce-part" className="text-sm font-normal cursor-pointer">
                Partner college event
              </Label>
            </div>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !hasToken || imageUploading}>
              {(loading || imageUploading) ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {loading ? "Saving…" : imageUploading ? "Uploading image…" : "Create event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
