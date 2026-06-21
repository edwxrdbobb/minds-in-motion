"use client";

import { useEffect, useRef, useState } from "react";
import { Chess, type Square } from "chess.js";
import { ChessBoard, type BoardMove } from "@/components/chess/chess-board";
import { EvalBar } from "@/components/chess/eval-bar";
import { MoveHistory } from "@/components/chess/move-history";
import { GameControls } from "@/components/chess/game-controls";
import { CoachPanel, type CoachEntry } from "@/components/chess/coach-panel";
import { analyzePosition, gradePlayedMove, pickEngineMove, type AnalysisResult } from "@/lib/chess/ai";
import { generateMoveCommentary } from "@/lib/chess/commentary";
import { getPlayPrefs, savePlayPrefs } from "@/lib/chess/progress";
import type { Difficulty, PlayerColor } from "@/lib/chess/utils";

function describeGameOver(chess: Chess): string | null {
  if (chess.isCheckmate()) return `Checkmate — ${chess.turn() === "w" ? "Black" : "White"} wins!`;
  if (chess.isStalemate()) return "Stalemate — it's a draw.";
  if (chess.isInsufficientMaterial()) return "Draw — insufficient material to continue.";
  if (chess.isThreefoldRepetition()) return "Draw by threefold repetition.";
  if (chess.isDrawByFiftyMoves()) return "Draw by the fifty-move rule.";
  if (chess.isDraw()) return "Draw.";
  return null;
}

export default function ChessPlayPage() {
  const chessRef = useRef(new Chess());
  const seqRef = useRef(0);
  const difficultyRef = useRef<Difficulty>("intermediate");
  const playerColorRef = useRef<PlayerColor>("w");

  const [seq, setSeq] = useState(0);
  const [fen, setFen] = useState(chessRef.current.fen());
  const [sanHistory, setSanHistory] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [coachFeed, setCoachFeed] = useState<CoachEntry[]>([]);
  const [pendingAnalysis, setPendingAnalysis] = useState<AnalysisResult | null>(null);
  const [thinking, setThinking] = useState(false);
  const [hintArrow, setHintArrow] = useState<{ from: Square; to: Square } | null>(null);
  const [gameOver, setGameOver] = useState<string | null>(null);

  const [difficulty, setDifficulty] = useState<Difficulty>("intermediate");
  const [playerColor, setPlayerColor] = useState<PlayerColor>("w");
  const [orientation, setOrientation] = useState<PlayerColor>("w");

  useEffect(() => {
    const prefs = getPlayPrefs();
    setDifficulty(prefs.difficulty);
    setPlayerColor(prefs.playerColor);
    setOrientation(prefs.playerColor);
    difficultyRef.current = prefs.difficulty;
    playerColorRef.current = prefs.playerColor;
  }, []);

  function bump() {
    seqRef.current += 1;
    setSeq(seqRef.current);
    setFen(chessRef.current.fen());
    setSanHistory(chessRef.current.history());
  }

  function startNewGame(color: PlayerColor, diff: Difficulty) {
    chessRef.current = new Chess();
    playerColorRef.current = color;
    difficultyRef.current = diff;
    setPlayerColor(color);
    setDifficulty(diff);
    setOrientation(color);
    setLastMove(null);
    setCoachFeed([]);
    setPendingAnalysis(null);
    setHintArrow(null);
    setGameOver(null);
    setThinking(false);
    savePlayPrefs({ playerColor: color, difficulty: diff });
    bump();
  }

  function handleDifficultyChange(diff: Difficulty) {
    difficultyRef.current = diff;
    setDifficulty(diff);
    savePlayPrefs({ playerColor: playerColorRef.current, difficulty: diff });
  }

  function handleColorChange(color: PlayerColor) {
    startNewGame(color, difficultyRef.current);
  }

  function handleUndo() {
    if (thinking || (chessRef.current.turn() === playerColorRef.current && !pendingAnalysis)) return;
    chessRef.current.undo();
    if (chessRef.current.turn() !== playerColorRef.current) {
      chessRef.current.undo();
    }
    setCoachFeed((feed) => feed.slice(0, -1));
    setHintArrow(null);
    setGameOver(null);
    bump();
  }

  function handleFlip() {
    setOrientation((o) => (o === "w" ? "b" : "w"));
  }

  function handleHint() {
    if (!pendingAnalysis?.best) return;
    setHintArrow({ from: pendingAnalysis.best.from, to: pendingAnalysis.best.to });
  }

  function handlePlayerMove(move: BoardMove) {
    if (thinking || gameOver) return;
    if (chessRef.current.turn() !== playerColorRef.current) return;

    const analysisForGrading = pendingAnalysis;
    const moveResult = chessRef.current.move({ from: move.from, to: move.to, promotion: move.promotion });
    setLastMove({ from: moveResult.from, to: moveResult.to });
    setHintArrow(null);

    const notes = generateMoveCommentary({ chessAfter: chessRef.current, move: moveResult });
    const grade = analysisForGrading ? gradePlayedMove(analysisForGrading, move) : null;

    setCoachFeed((feed) => [
      ...feed,
      {
        id: `${seqRef.current}-${moveResult.san}`,
        moveNumber: Math.ceil(chessRef.current.history().length / 2),
        mover: moveResult.color,
        san: moveResult.san,
        quality: grade?.quality,
        notes,
      },
    ]);

    setPendingAnalysis(null);
    const overMessage = describeGameOver(chessRef.current);
    if (overMessage) setGameOver(overMessage);
    bump();
  }

  // Drives both the engine's own replies and the background analysis that powers
  // hints + move grading for the player's side, keyed off real game-state changes only.
  useEffect(() => {
    if (chessRef.current.isGameOver()) {
      setGameOver(describeGameOver(chessRef.current));
      return;
    }

    let cancelled = false;
    const isPlayersTurn = chessRef.current.turn() === playerColorRef.current;

    if (isPlayersTurn) {
      setPendingAnalysis(null);
      analyzePosition(chessRef.current, difficultyRef.current).then((result) => {
        if (!cancelled) setPendingAnalysis(result);
      });
    } else {
      setThinking(true);
      analyzePosition(chessRef.current, difficultyRef.current).then((analysis) => {
        if (cancelled) return;
        const chosen = pickEngineMove(analysis, difficultyRef.current);
        if (chosen) {
          const moveResult = chessRef.current.move({ from: chosen.from, to: chosen.to, promotion: chosen.promotion });
          setLastMove({ from: moveResult.from, to: moveResult.to });
          const overMessage = describeGameOver(chessRef.current);
          if (overMessage) setGameOver(overMessage);
          bump();
        }
        setThinking(false);
      });
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seq]);

  const isPlayerTurn = !gameOver && !thinking && chessRef.current.turn() === playerColor;
  const busy = thinking || (isPlayerTurn && !pendingAnalysis);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Play vs Computer</h1>
        <p className="mt-2 text-white/60">Every move comes with feedback — play, learn, improve.</p>
      </div>

      <div className="flex flex-col items-start gap-6 lg:flex-row lg:justify-center">
        <div className="flex w-full justify-center gap-3 lg:w-auto">
          <EvalBar evalCp={pendingAnalysis?.evalCp ?? 0} className="h-[480px] sm:h-[560px]" />
          <div className="flex flex-col gap-2">
            <ChessBoard
              fen={fen}
              orientation={orientation}
              interactive={isPlayerTurn}
              onMove={handlePlayerMove}
              lastMove={lastMove}
              hintArrow={hintArrow}
            />
            {(thinking || gameOver) && (
              <div className="text-center text-sm font-medium text-white/70">
                {gameOver ?? "Computer is thinking…"}
              </div>
            )}
          </div>
        </div>

        <div className="flex w-full max-w-sm flex-col gap-4">
          <GameControls
            difficulty={difficulty}
            playerColor={playerColor}
            onDifficultyChange={handleDifficultyChange}
            onColorChange={handleColorChange}
            onNewGame={() => startNewGame(playerColor, difficulty)}
            onUndo={handleUndo}
            onFlip={handleFlip}
            canUndo={sanHistory.length > 0}
            disabled={busy}
          />
          <CoachPanel
            entries={coachFeed}
            onHint={handleHint}
            hintDisabled={!isPlayerTurn || !pendingAnalysis?.best}
            thinking={!pendingAnalysis && isPlayerTurn}
          />
          <MoveHistory sanMoves={sanHistory} />
        </div>
      </div>
    </div>
  );
}
