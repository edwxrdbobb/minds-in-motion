"use client";

import { Lightbulb, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { MoveQuality } from "@/lib/chess/ai";
import { cn } from "@/lib/utils";

export interface CoachEntry {
  id: string;
  moveNumber: number;
  mover: "w" | "b";
  san: string;
  quality?: MoveQuality;
  notes: string[];
}

interface CoachPanelProps {
  entries: CoachEntry[];
  onHint: () => void;
  hintDisabled?: boolean;
  thinking?: boolean;
  className?: string;
}

const QUALITY_LABELS: Record<MoveQuality, string> = {
  best: "Best",
  good: "Good",
  inaccuracy: "Inaccuracy",
  mistake: "Mistake",
  blunder: "Blunder",
};

const QUALITY_CLASSES: Record<MoveQuality, string> = {
  best: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  good: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  inaccuracy: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  mistake: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  blunder: "bg-red-500/15 text-red-400 border-red-500/30",
};

export function CoachPanel({ entries, onHint, hintDisabled, thinking, className }: CoachPanelProps) {
  const ordered = [...entries].reverse();

  return (
    <div className={cn("flex flex-col rounded-xl border border-border bg-card", className)}>
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="text-sm font-medium text-foreground">Coach</span>
        <Button size="sm" variant="outline" onClick={onHint} disabled={hintDisabled} className="gap-1.5">
          {thinking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Lightbulb className="h-3.5 w-3.5" />}
          Hint
        </Button>
      </div>
      <ScrollArea className="h-56">
        <div className="flex flex-col gap-3 px-4 py-3">
          {ordered.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Make a move and your coach will weigh in here.
            </p>
          ) : (
            ordered.map((entry) => (
              <div key={entry.id} className="space-y-1 border-b border-border/50 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {entry.moveNumber}. {entry.san}
                  </span>
                  {entry.quality && (
                    <Badge variant="outline" className={QUALITY_CLASSES[entry.quality]}>
                      {QUALITY_LABELS[entry.quality]}
                    </Badge>
                  )}
                </div>
                {entry.notes.map((note, i) => (
                  <p key={i} className="text-sm text-muted-foreground">
                    {note}
                  </p>
                ))}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
