import { DEFAULT_POSITION, type PieceSymbol, type Square } from "chess.js";

export type Difficulty = "beginner" | "intermediate" | "advanced";
export type PlayerColor = "w" | "b";

export const START_FEN = DEFAULT_POSITION;

export const PIECE_NAMES: Record<PieceSymbol, string> = {
  p: "pawn",
  n: "knight",
  b: "bishop",
  r: "rook",
  q: "queen",
  k: "king",
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export interface UciMove {
  from: Square;
  to: Square;
  promotion?: PieceSymbol;
}

/** Encodes a move as a UCI-style string, e.g. "e2e4" or "e7e8q" for promotion. */
export function encodeMove(move: UciMove): string {
  return `${move.from}${move.to}${move.promotion ?? ""}`;
}

/** Decodes a UCI-style move string back into from/to/promotion parts. */
export function decodeMove(code: string): UciMove {
  return {
    from: code.slice(0, 2) as Square,
    to: code.slice(2, 4) as Square,
    promotion: code.length > 4 ? (code.slice(4) as PieceSymbol) : undefined,
  };
}

export function squareColor(square: Square): "light" | "dark" {
  const file = square.charCodeAt(0) - 97;
  const rank = parseInt(square[1], 10);
  return (file + rank) % 2 === 0 ? "dark" : "light";
}

export function squareToCoords(square: Square): { file: number; rank: number } {
  return {
    file: square.charCodeAt(0) - 97,
    rank: parseInt(square[1], 10) - 1,
  };
}

export function coordsToSquare(file: number, rank: number): Square {
  return `${String.fromCharCode(97 + file)}${rank + 1}` as Square;
}
