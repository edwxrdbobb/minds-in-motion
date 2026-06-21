"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Chess } from "chess.js";
import { CheckCircle2, XCircle, ArrowRight, Lightbulb, PartyPopper } from "lucide-react";
import { ChessBoard, type BoardMove } from "@/components/chess/chess-board";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Lesson } from "@/lib/chess/lessons";
import { encodeMove, decodeMove } from "@/lib/chess/utils";
import { recordStepComplete, recordLessonComplete } from "@/lib/chess/progress";

interface LessonPlayerProps {
  lesson: Lesson;
  nextLesson?: Lesson;
}

const XP_BY_STEP_TYPE = { concept: 5, quiz: 10, puzzle: 15 } as const;

export function LessonPlayer({ lesson, nextLesson }: LessonPlayerProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [displayFen, setDisplayFen] = useState<string | null>(null);
  const [totalXp, setTotalXp] = useState(0);
  const [done, setDone] = useState(false);

  const step = lesson.steps[stepIndex];
  const progressPercent = (stepIndex / lesson.steps.length) * 100;

  const hintArrow = useMemo(() => {
    if (!revealed || step.type !== "puzzle") return null;
    const { from, to } = decodeMove(step.solution[0]);
    return { from, to };
  }, [revealed, step]);

  function resetStepState() {
    setAttempts(0);
    setFeedback(null);
    setRevealed(false);
    setDisplayFen(null);
  }

  function awardXp(amount: number) {
    recordStepComplete(lesson.id, stepIndex, amount);
    setTotalXp((xp) => xp + amount);
  }

  function goNext() {
    if (stepIndex + 1 >= lesson.steps.length) {
      recordLessonComplete(lesson.id);
      setDone(true);
      return;
    }
    setStepIndex((i) => i + 1);
    resetStepState();
  }

  function handleConceptNext() {
    awardXp(XP_BY_STEP_TYPE.concept);
    goNext();
  }

  function handleQuizSelect(index: number) {
    if (step.type !== "quiz" || feedback) return;
    const correct = index === step.correctIndex;
    setFeedback({ correct, message: step.explanation });
    if (correct) awardXp(XP_BY_STEP_TYPE.quiz);
  }

  function handlePuzzleMove(move: BoardMove) {
    if (step.type !== "puzzle" || feedback?.correct) return;
    const uci = encodeMove(move);
    const correct = step.solution.includes(uci);

    if (correct) {
      const scratch = new Chess(step.fen);
      scratch.move({ from: move.from, to: move.to, promotion: move.promotion });
      setDisplayFen(scratch.fen());
      setFeedback({ correct: true, message: step.explainCorrect });
      awardXp(XP_BY_STEP_TYPE.puzzle);
    } else {
      setAttempts((a) => a + 1);
      setFeedback({ correct: false, message: step.explainWrong });
    }
  }

  if (done) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center">
        <PartyPopper className="h-12 w-12 text-emerald-400" />
        <h2 className="text-2xl font-bold text-foreground">Lesson complete!</h2>
        <p className="text-muted-foreground">You earned {totalXp} XP in &ldquo;{lesson.title}.&rdquo;</p>
        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <Button asChild variant="outline" className="flex-1">
            <Link href="/chess/learn">Back to Lessons</Link>
          </Button>
          {nextLesson ? (
            <Button asChild className="flex-1">
              <Link href={`/chess/learn/${nextLesson.id}`}>Next Lesson</Link>
            </Button>
          ) : (
            <Button asChild className="flex-1">
              <Link href="/chess/play">Play vs Computer</Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <div className="flex items-center gap-3">
        <Progress value={progressPercent} className="flex-1" />
        <span className="text-xs text-muted-foreground">
          {stepIndex + 1}/{lesson.steps.length}
        </span>
      </div>

      {step.type === "concept" && (
        <div className="flex flex-col gap-4">
          <ChessBoard
            fen={step.fen}
            interactive={false}
            highlightSquares={step.highlightSquares}
            orientation="w"
          />
          <p className="text-base text-foreground">{step.text}</p>
          <Button onClick={handleConceptNext} className="gap-2 self-end">
            Next <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {step.type === "quiz" && (
        <div className="flex flex-col gap-4">
          <p className="text-base font-medium text-foreground">{step.question}</p>
          <div className="flex flex-col gap-2">
            {step.options.map((option, index) => {
              const isChosen = feedback && index === step.correctIndex;
              return (
                <button
                  key={option}
                  onClick={() => handleQuizSelect(index)}
                  disabled={Boolean(feedback)}
                  className={`rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                    isChosen
                      ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-300"
                      : "border-border bg-secondary/40 text-foreground hover:bg-secondary/70"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
          {feedback && (
            <FeedbackBanner correct={feedback.correct} message={feedback.message} onContinue={goNext} />
          )}
        </div>
      )}

      {step.type === "puzzle" && (
        <div className="flex flex-col gap-4">
          <ChessBoard
            fen={displayFen ?? step.fen}
            interactive={!feedback?.correct}
            onMove={handlePuzzleMove}
            hintArrow={hintArrow}
            orientation={step.orientation ?? (new Chess(step.fen).turn())}
          />
          <p className="text-base text-foreground">{step.prompt}</p>

          {feedback && <FeedbackBanner correct={feedback.correct} message={feedback.message} onContinue={feedback.correct ? goNext : undefined} />}

          {!feedback?.correct && attempts >= 2 && !revealed && (
            <Button variant="outline" onClick={() => setRevealed(true)} className="gap-2 self-start">
              <Lightbulb className="h-4 w-4" />
              Show me
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function FeedbackBanner({
  correct,
  message,
  onContinue,
}: {
  correct: boolean;
  message: string;
  onContinue?: () => void;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 ${
        correct ? "border-emerald-400/40 bg-emerald-500/10" : "border-amber-400/40 bg-amber-500/10"
      }`}
    >
      <div className="flex items-start gap-2">
        {correct ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
        ) : (
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
        )}
        <p className="text-sm text-foreground">{message}</p>
      </div>
      {onContinue && (
        <Button size="sm" onClick={onContinue} className="shrink-0 gap-1.5">
          Continue <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
