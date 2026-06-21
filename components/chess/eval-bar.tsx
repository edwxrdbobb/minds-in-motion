"use client";

import { cn } from "@/lib/utils";

interface EvalBarProps {
  evalCp: number;
  className?: string;
}

const CLAMP_CP = 1000;
const MATE_THRESHOLD = 5000;

export function EvalBar({ evalCp, className }: EvalBarProps) {
  const isMate = Math.abs(evalCp) > MATE_THRESHOLD;
  const clamped = Math.max(-CLAMP_CP, Math.min(CLAMP_CP, evalCp));
  const whitePercent = isMate ? (evalCp > 0 ? 100 : 0) : 50 + (clamped / CLAMP_CP) * 50;

  const label = isMate
    ? evalCp > 0 ? "Mate" : "Mate"
    : (evalCp / 100).toFixed(1);

  return (
    <div className={cn("flex w-6 flex-col items-center gap-2", className)}>
      <div className="relative flex-1 w-full overflow-hidden rounded-full border border-border bg-[#3a3733]">
        <div
          className="absolute bottom-0 left-0 w-full bg-[#e8e6e1] transition-[height] duration-500"
          style={{ height: `${whitePercent}%` }}
        />
      </div>
      <span className="text-[11px] font-medium text-muted-foreground tabular-nums">{label}</span>
    </div>
  );
}
