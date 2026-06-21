import { Chess, type Move, type PieceSymbol, type Square } from "chess.js";
import { evaluatePosition, PIECE_VALUES } from "./evaluate";
import type { Difficulty } from "./utils";

const MATE_SCORE = 100_000;

interface SearchConfig {
  maxDepth: number;
  timeBudgetMs: number;
  /** Chance the engine plays a slightly-off move instead of the best one, so weaker levels are beatable. */
  blunderChance: number;
}

const CONFIG: Record<Difficulty, SearchConfig> = {
  beginner: { maxDepth: 2, timeBudgetMs: 250, blunderChance: 0.3 },
  intermediate: { maxDepth: 3, timeBudgetMs: 600, blunderChance: 0.08 },
  advanced: { maxDepth: 5, timeBudgetMs: 1500, blunderChance: 0 },
};

export interface ScoredMove {
  from: Square;
  to: Square;
  promotion?: PieceSymbol;
  san: string;
  /** Score in centipawns relative to the side that owns this move (positive = good for the mover). */
  score: number;
}

export interface AnalysisResult {
  best: ScoredMove | null;
  /** All legal moves at the root, ranked best first. */
  allMoves: ScoredMove[];
  /** Engine evaluation in centipawns from White's perspective. */
  evalCp: number;
  depthReached: number;
}

export type MoveQuality = "best" | "good" | "inaccuracy" | "mistake" | "blunder";

function moveOrderScore(move: Move): number {
  let score = 0;
  if (move.captured) {
    score += PIECE_VALUES[move.captured] * 10 - PIECE_VALUES[move.piece];
  }
  if (move.promotion) {
    score += PIECE_VALUES[move.promotion];
  }
  return score;
}

function orderMoves(moves: Move[]): Move[] {
  return [...moves].sort((a, b) => moveOrderScore(b) - moveOrderScore(a));
}

function quiescence(
  chess: Chess,
  alpha: number,
  beta: number,
  color: 1 | -1,
  deadline: number,
): number {
  const standPat = color * evaluatePosition(chess);
  if (standPat >= beta) return beta;
  if (standPat > alpha) alpha = standPat;
  if (Date.now() > deadline) return alpha;

  const captures = orderMoves(
    chess.moves({ verbose: true }).filter((m) => m.captured || m.promotion),
  );

  for (const move of captures) {
    chess.move({ from: move.from, to: move.to, promotion: move.promotion });
    const score = -quiescence(chess, -beta, -alpha, color === 1 ? -1 : 1, deadline);
    chess.undo();

    if (score >= beta) return beta;
    if (score > alpha) alpha = score;
  }

  return alpha;
}

function negamax(
  chess: Chess,
  depth: number,
  ply: number,
  alpha: number,
  beta: number,
  color: 1 | -1,
  deadline: number,
): number {
  if (chess.isCheckmate()) return -(MATE_SCORE - ply);
  if (chess.isDraw() || chess.isStalemate()) return 0;
  if (depth === 0) return quiescence(chess, alpha, beta, color, deadline);
  if (Date.now() > deadline) return color * evaluatePosition(chess);

  let best = -Infinity;
  const moves = orderMoves(chess.moves({ verbose: true }));

  for (const move of moves) {
    chess.move({ from: move.from, to: move.to, promotion: move.promotion });
    const score = -negamax(chess, depth - 1, ply + 1, -beta, -alpha, color === 1 ? -1 : 1, deadline);
    chess.undo();

    if (score > best) best = score;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }

  return best;
}

function toScoredMove(move: Move, score: number): ScoredMove {
  return { from: move.from, to: move.to, promotion: move.promotion, san: move.san, score };
}

/** Yields control back to the browser so the UI can paint between search iterations. */
function yieldToUi(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Analyzes the current position to the given difficulty's depth/time budget.
 * Returns every legal root move ranked by score, so callers can use the same
 * call both to pick the engine's reply and to grade a player's move.
 */
export async function analyzePosition(
  chess: Chess,
  difficulty: Difficulty,
): Promise<AnalysisResult> {
  const config = CONFIG[difficulty];
  const rootMoves = chess.moves({ verbose: true });

  if (rootMoves.length === 0) {
    const inCheck = chess.inCheck();
    return {
      best: null,
      allMoves: [],
      evalCp: inCheck ? (chess.turn() === "w" ? -MATE_SCORE : MATE_SCORE) : 0,
      depthReached: 0,
    };
  }

  const color: 1 | -1 = chess.turn() === "w" ? 1 : -1;
  const deadline = Date.now() + config.timeBudgetMs;

  let ranked = orderMoves(rootMoves).map((move) => toScoredMove(move, 0));
  let depthReached = 0;

  for (let depth = 1; depth <= config.maxDepth; depth++) {
    const alpha0 = -Infinity;
    const beta0 = Infinity;
    const results: ScoredMove[] = [];

    const searchOrder = [...ranked]
      .sort((a, b) => b.score - a.score)
      .map((scored) => rootMoves.find((m) => m.from === scored.from && m.to === scored.to && m.promotion === scored.promotion)!);

    let alpha = alpha0;
    for (const move of searchOrder) {
      chess.move({ from: move.from, to: move.to, promotion: move.promotion });
      const score = -negamax(chess, depth - 1, 1, -beta0, -alpha, color === 1 ? -1 : 1, deadline);
      chess.undo();
      results.push(toScoredMove(move, score));
      if (score > alpha) alpha = score;
    }

    results.sort((a, b) => b.score - a.score);
    ranked = results;
    depthReached = depth;

    if (Date.now() > deadline) break;
    await yieldToUi();
    if (Date.now() > deadline) break;
  }

  const best = ranked[0] ?? null;
  const evalCp = best ? color * best.score : 0;

  return { best, allMoves: ranked, evalCp, depthReached };
}

/**
 * Picks the move the engine should actually play, applying the difficulty's
 * "blunder chance" so lower levels feel human and beatable rather than
 * perfectly optimal.
 */
export function pickEngineMove(analysis: AnalysisResult, difficulty: Difficulty): ScoredMove | null {
  const { allMoves } = analysis;
  if (allMoves.length === 0) return null;

  const config = CONFIG[difficulty];
  if (config.blunderChance > 0 && allMoves.length > 1 && Math.random() < config.blunderChance) {
    const pool = allMoves.slice(0, Math.min(3, allMoves.length));
    return pool[Math.floor(Math.random() * pool.length)];
  }

  return allMoves[0];
}

export function classifyMoveQuality(centipawnLoss: number): MoveQuality {
  const loss = Math.max(0, centipawnLoss);
  if (loss < 20) return "best";
  if (loss < 50) return "good";
  if (loss < 150) return "inaccuracy";
  if (loss < 300) return "mistake";
  return "blunder";
}

/** Finds the player's played move inside a prior analysis and grades it against the best available move. */
export function gradePlayedMove(
  analysis: AnalysisResult,
  played: { from: Square; to: Square; promotion?: PieceSymbol },
): { quality: MoveQuality; lossCp: number } | null {
  if (!analysis.best) return null;

  const playedScored = analysis.allMoves.find(
    (m) => m.from === played.from && m.to === played.to && (m.promotion ?? undefined) === (played.promotion ?? undefined),
  );
  if (!playedScored) return null;

  const lossCp = analysis.best.score - playedScored.score;
  return { quality: classifyMoveQuality(lossCp), lossCp };
}
