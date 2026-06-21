"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface MoveHistoryProps {
  sanMoves: string[];
  className?: string;
}

export function MoveHistory({ sanMoves, className }: MoveHistoryProps) {
  const pairs: Array<{ number: number; white?: string; black?: string }> = [];
  for (let i = 0; i < sanMoves.length; i += 2) {
    pairs.push({ number: i / 2 + 1, white: sanMoves[i], black: sanMoves[i + 1] });
  }

  return (
    <div className={cn("rounded-xl border border-border bg-card", className)}>
      <div className="border-b border-border px-4 py-2.5 text-sm font-medium text-foreground">Moves</div>
      <ScrollArea className="h-48">
        <div className="px-4 py-2">
          {pairs.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No moves yet.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {pairs.map((pair) => (
                  <tr key={pair.number} className="border-b border-border/50 last:border-0">
                    <td className="w-8 py-1.5 text-muted-foreground">{pair.number}.</td>
                    <td className="py-1.5 text-foreground">{pair.white}</td>
                    <td className="py-1.5 text-foreground">{pair.black}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
