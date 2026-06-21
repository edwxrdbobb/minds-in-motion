"use client";

import { useMemo, useState } from "react";
import { Chess, type PieceSymbol, type Square } from "chess.js";
import { ChessPieceIcon } from "@/lib/chess/pieces";
import { squareColor } from "@/lib/chess/utils";
import { cn } from "@/lib/utils";

export interface BoardMove {
  from: Square;
  to: Square;
  promotion?: PieceSymbol;
}

interface ChessBoardProps {
  fen: string;
  orientation?: "w" | "b";
  interactive?: boolean;
  onMove?: (move: BoardMove) => void;
  lastMove?: { from: Square; to: Square } | null;
  highlightSquares?: string[];
  hintArrow?: { from: Square; to: Square } | null;
  className?: string;
}

const PROMOTION_CHOICES: PieceSymbol[] = ["q", "r", "b", "n"];

function squareCenter(square: Square, orientation: "w" | "b") {
  const file = square.charCodeAt(0) - 97;
  const rank = parseInt(square[1], 10) - 1;
  const col = orientation === "b" ? 7 - file : file;
  const row = orientation === "b" ? rank : 7 - rank;
  return { xPercent: (col + 0.5) * 12.5, yPercent: (row + 0.5) * 12.5 };
}

export function ChessBoard({
  fen,
  orientation = "w",
  interactive = true,
  onMove,
  lastMove,
  highlightSquares,
  hintArrow,
  className,
}: ChessBoardProps) {
  const [selected, setSelected] = useState<Square | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);

  const chess = useMemo(() => new Chess(fen), [fen]);
  const turn = chess.turn();
  const inCheck = chess.inCheck();
  const checkedKingSquare = useMemo(() => {
    if (!inCheck) return null;
    return chess.findPiece({ type: "k", color: turn })[0] ?? null;
  }, [chess, inCheck, turn]);

  const legalTargets = useMemo(() => {
    if (!selected) return new Map<string, boolean>();
    const moves = chess.moves({ square: selected, verbose: true });
    return new Map(moves.map((m) => [m.to, Boolean(m.captured)]));
  }, [chess, selected]);

  const files = orientation === "b" ? ["h", "g", "f", "e", "d", "c", "b", "a"] : ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = orientation === "b" ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];

  function attemptMove(from: Square, to: Square) {
    const candidates = chess.moves({ square: from, verbose: true }).filter((m) => m.to === to);
    if (candidates.length === 0) return;

    if (candidates.some((m) => m.promotion)) {
      setPendingPromotion({ from, to });
      setSelected(null);
      return;
    }

    onMove?.({ from, to });
    setSelected(null);
  }

  function handleSquareClick(square: Square) {
    if (!interactive || pendingPromotion) return;

    if (selected && legalTargets.has(square)) {
      attemptMove(selected, square);
      return;
    }

    const piece = chess.get(square);
    if (piece && piece.color === turn) {
      setSelected(square === selected ? null : square);
    } else {
      setSelected(null);
    }
  }

  function choosePromotion(piece: PieceSymbol) {
    if (!pendingPromotion) return;
    onMove?.({ from: pendingPromotion.from, to: pendingPromotion.to, promotion: piece });
    setPendingPromotion(null);
  }

  return (
    <div className={cn("relative w-full max-w-[560px] select-none", className)}>
      <div className="grid grid-cols-8 grid-rows-8 aspect-square w-full overflow-hidden rounded-lg border border-border shadow-lg">
        {ranks.map((rank) =>
          files.map((file) => {
            const square = `${file}${rank}` as Square;
            const piece = chess.get(square);
            const color = squareColor(square);
            const isSelected = selected === square;
            const isLegalTarget = legalTargets.has(square);
            const isCapture = legalTargets.get(square);
            const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square);
            const isChecked = checkedKingSquare === square;
            const isHighlighted = highlightSquares?.includes(square);

            return (
              <button
                key={square}
                type="button"
                onClick={() => handleSquareClick(square)}
                className={cn(
                  "relative flex items-center justify-center focus:outline-none",
                  color === "light" ? "bg-[#d8d4cc]" : "bg-[#4a4642]",
                  interactive && "cursor-pointer",
                )}
                aria-label={square}
              >
                {isLastMove && <div className="absolute inset-0 bg-amber-400/25" />}
                {isHighlighted && <div className="absolute inset-0 bg-emerald-400/30 ring-2 ring-inset ring-emerald-400/70" />}
                {isSelected && <div className="absolute inset-0 bg-emerald-300/30" />}
                {isChecked && <div className="absolute inset-0 bg-red-500/45" />}

                {piece && (
                  <ChessPieceIcon
                    type={piece.type}
                    color={piece.color}
                    className="relative z-10 h-[78%] w-[78%] drop-shadow-sm"
                  />
                )}

                {isLegalTarget && !piece && (
                  <div className="absolute h-[28%] w-[28%] rounded-full bg-foreground/35" />
                )}
                {isLegalTarget && isCapture && (
                  <div className="absolute inset-[6%] rounded-full ring-[3px] ring-foreground/45" />
                )}
              </button>
            );
          }),
        )}
      </div>

      {hintArrow && (
        <svg
          viewBox="0 0 100 100"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <defs>
            <marker id="chess-hint-arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="rgba(16,185,129,0.9)" />
            </marker>
          </defs>
          {(() => {
            const from = squareCenter(hintArrow.from, orientation);
            const to = squareCenter(hintArrow.to, orientation);
            return (
              <line
                x1={from.xPercent}
                y1={from.yPercent}
                x2={to.xPercent}
                y2={to.yPercent}
                stroke="rgba(16,185,129,0.9)"
                strokeWidth={2.5}
                markerEnd="url(#chess-hint-arrowhead)"
              />
            );
          })()}
        </svg>
      )}

      {pendingPromotion && (
        <div
          className="absolute z-20 flex -translate-x-1/2 -translate-y-1/2 gap-1 rounded-lg border border-border bg-popover p-1.5 shadow-xl"
          style={{
            left: `${squareCenter(pendingPromotion.to, orientation).xPercent}%`,
            top: `${squareCenter(pendingPromotion.to, orientation).yPercent}%`,
          }}
        >
          {PROMOTION_CHOICES.map((piece) => (
            <button
              key={piece}
              type="button"
              onClick={() => choosePromotion(piece)}
              className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary hover:bg-secondary/70 transition-colors"
              aria-label={`Promote to ${piece}`}
            >
              <ChessPieceIcon type={piece} color={turn} className="h-8 w-8" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
