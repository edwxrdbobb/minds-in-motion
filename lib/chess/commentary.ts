import type { Chess, Move } from "chess.js";
import { PIECE_VALUES } from "./evaluate";
import { PIECE_NAMES } from "./utils";

const CENTER_SQUARES = new Set(["d4", "d5", "e4", "e5"]);

const MINOR_PIECE_START_SQUARES: Record<string, string[]> = {
  wn: ["b1", "g1"],
  wb: ["c1", "f1"],
  bn: ["b8", "g8"],
  bb: ["c8", "f8"],
};

export interface CommentaryContext {
  chessAfter: Chess;
  move: Move;
}

/**
 * Rule-based, plain-English notes about a move for the coaching feed.
 * Not an exhaustive annotator — just calls out the common teaching moments.
 */
export function generateMoveCommentary({ chessAfter, move }: CommentaryContext): string[] {
  const notes: string[] = [];
  const mover = move.color;
  const opponent = mover === "w" ? "b" : "w";

  if (move.isKingsideCastle() || move.isQueensideCastle()) {
    notes.push("Castled — your king is tucked away safely now.");
  }

  if (move.isEnPassant()) {
    notes.push("Captured en passant — a sneaky special pawn capture!");
  } else if (move.captured) {
    const capturedValue = PIECE_VALUES[move.captured];
    const moverValue = PIECE_VALUES[move.piece];
    if (capturedValue >= moverValue) {
      notes.push(`Good trade — you won a ${PIECE_NAMES[move.captured]} with your ${PIECE_NAMES[move.piece]}.`);
    } else {
      notes.push(`You captured the ${PIECE_NAMES[move.captured]}.`);
    }
  }

  if (move.isPromotion() && move.promotion) {
    notes.push(`Pawn promoted to a ${PIECE_NAMES[move.promotion]}!`);
  }

  if (chessAfter.isCheckmate()) {
    notes.push("Checkmate!");
  } else if (chessAfter.inCheck()) {
    notes.push("That move puts the opponent in check!");
  }

  if (move.piece !== "k") {
    const attackers = chessAfter.attackers(move.to, opponent);
    const defenders = chessAfter.attackers(move.to, mover);
    if (attackers.length > 0 && defenders.length === 0) {
      notes.push(`Careful — your ${PIECE_NAMES[move.piece]} on ${move.to} is undefended and can be captured.`);
    }
  }

  if (CENTER_SQUARES.has(move.to) && (move.piece === "p" || move.piece === "n" || move.piece === "b")) {
    notes.push("Nice — controlling a central square gives your pieces more influence.");
  }

  const startSquares = MINOR_PIECE_START_SQUARES[`${mover}${move.piece}`];
  if (startSquares?.includes(move.from)) {
    notes.push(`Good development — getting your ${PIECE_NAMES[move.piece]} into the game.`);
  }

  return notes;
}
