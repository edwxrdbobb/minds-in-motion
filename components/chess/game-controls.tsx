"use client";

import { RotateCcw, FlipVertical2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DIFFICULTY_LABELS, type Difficulty, type PlayerColor } from "@/lib/chess/utils";

interface GameControlsProps {
  difficulty: Difficulty;
  playerColor: PlayerColor;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onColorChange: (color: PlayerColor) => void;
  onNewGame: () => void;
  onUndo: () => void;
  onFlip: () => void;
  canUndo: boolean;
  disabled?: boolean;
}

export function GameControls({
  difficulty,
  playerColor,
  onDifficultyChange,
  onColorChange,
  onNewGame,
  onUndo,
  onFlip,
  canUndo,
  disabled,
}: GameControlsProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <span className="text-xs text-muted-foreground">Difficulty</span>
          <Select value={difficulty} onValueChange={(v) => onDifficultyChange(v as Difficulty)} disabled={disabled}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <span className="text-xs text-muted-foreground">Play as</span>
          <Select value={playerColor} onValueChange={(v) => onColorChange(v as PlayerColor)} disabled={disabled}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="w">White</SelectItem>
              <SelectItem value="b">Black</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={onNewGame} className="flex-1 gap-2">
          <RotateCcw className="h-4 w-4" />
          New Game
        </Button>
        <Button variant="outline" size="icon" onClick={onUndo} disabled={!canUndo || disabled} aria-label="Undo move">
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onFlip} aria-label="Flip board">
          <FlipVertical2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
