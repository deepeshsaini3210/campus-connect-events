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
import {
  categoryNameToId,
  fetchEventRawById,
  updateEvent,
  uploadEventImage,
  type UpdateEventPayload,
} from "@/lib/api/events";
import type { CollegeEvent } from "@/lib/events-data";
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

type Props = {
  event: CollegeEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
};

export function EditEventDialog({ event, open, onOpenChange, onUpdated }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(1);
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("10:00");
  const [venue, setVenue] = useState("");
  const [mode, setMode] = useState<UpdateEventPayload["mode"]>("OFFLINE");
  const [fee, setFee] = useState("0");
  const [seatsTotal, setSeatsTotal] = useState("100");
  const [deadline, setDeadline] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPartnerEvent, setIsPartnerEvent] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [highlightsText, setHighlightsText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !event) return;
    let cancelled = false;
    (async () => {
      setLoadingEvent(true);
      setError("");
      try {
        const raw = await fetchEventRawById(event.id);
        if (cancelled) return;
        setTitle(raw.title);
        setDescription(raw.description);
        setCategoryId(raw.category?.name ? categoryNameToId(raw.category.name) : categoryNameToId(event.category));
        setEventDate(raw.eventDate);
        setEventTime(raw.eventTime?.slice(0, 5) ?? "10:00");
        setVenue(raw.venue);
        setMode(raw.mode);
        setFee(String(raw.fee ?? 0));
        setSeatsTotal(String(raw.seatsTotal ?? 100));
        setDeadline(raw.deadline);
        setIsFeatured(Boolean(raw.isFeatured));
        setIsPartnerEvent(Boolean(raw.isPartnerEvent));
        setImageUrl(raw.imageUrl ?? null);
        setHighlightsText((raw.highlights || []).join("\n"));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load event.");
      } finally {
        if (!cancelled) setLoadingEvent(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, event]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!event) return;
    setError("");
    setLoading(true);
    try {
      let nextImageUrl = imageUrl;
      if (posterFile) {
        nextImageUrl = await uploadEventImage(posterFile);
      }
      const highlights = highlightsText
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, 5);
      await updateEvent(event.id, {
        title: title.trim(),
        description: description.trim(),
        categoryId,
        eventDate,
        eventTime,
        venue: venue.trim(),
        mode,
        fee: Number(fee),
        seatsTotal: Math.max(1, Number.parseInt(seatsTotal, 10) || 1),
        deadline,
        isFeatured,
        isPartnerEvent,
        imageUrl: nextImageUrl,
        highlights: highlights.length ? highlights : undefined,
      });
      onUpdated();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update event.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Edit event</DialogTitle>
          <DialogDescription>Update event details. Poster upload is optional.</DialogDescription>
        </DialogHeader>
        {loadingEvent ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ee-title">Title</Label>
              <Input id="ee-title" value={title} onChange={(e) => setTitle(e.target.value)} required minLength={5} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ee-desc">Description</Label>
              <Textarea id="ee-desc" value={description} onChange={(e) => setDescription(e.target.value)} required minLength={20} rows={4} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ee-cat">Category</Label>
                <select
                  id="ee-cat"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                <Label htmlFor="ee-mode">Mode</Label>
                <select
                  id="ee-mode"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={mode}
                  onChange={(e) => setMode(e.target.value as UpdateEventPayload["mode"])}
                >
                  <option value="OFFLINE">Offline</option>
                  <option value="ONLINE">Online</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ee-date">Event date</Label>
                <Input id="ee-date" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ee-time">Event time</Label>
                <Input id="ee-time" type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ee-venue">Venue</Label>
              <Input id="ee-venue" value={venue} onChange={(e) => setVenue(e.target.value)} required />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ee-fee">Fee (₹)</Label>
                <Input id="ee-fee" type="number" min={0} value={fee} onChange={(e) => setFee(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ee-seats">Total seats</Label>
                <Input id="ee-seats" type="number" min={1} value={seatsTotal} onChange={(e) => setSeatsTotal(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ee-deadline">Deadline</Label>
                <Input id="ee-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ee-poster">Replace poster (optional)</Label>
              <Input id="ee-poster" type="file" accept="image/*" onChange={(e) => setPosterFile(e.target.files?.[0] ?? null)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ee-high">Highlights</Label>
              <Textarea id="ee-high" rows={3} value={highlightsText} onChange={(e) => setHighlightsText(e.target.value)} />
            </div>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="ee-feat" checked={isFeatured} onCheckedChange={(v) => setIsFeatured(v === true)} />
                <Label htmlFor="ee-feat" className="text-sm font-normal">Featured</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="ee-part" checked={isPartnerEvent} onCheckedChange={(v) => setIsPartnerEvent(v === true)} />
                <Label htmlFor="ee-part" className="text-sm font-normal">Partner event</Label>
              </div>
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save changes
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
