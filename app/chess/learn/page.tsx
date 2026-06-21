"use client";

import { useEffect, useState } from "react";
import { Flame, Star } from "lucide-react";
import { LessonPath } from "@/components/chess/lesson-path";
import { LESSONS } from "@/lib/chess/lessons";
import { getLearnProgress, type LearnProgress } from "@/lib/chess/progress";

export default function ChessLearnPage() {
  const [progress, setProgress] = useState<LearnProgress | null>(null);

  useEffect(() => {
    setProgress(getLearnProgress());
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Learn Chess</h1>
        <p className="mt-2 text-white/60">Bite-sized lessons — work through them in order.</p>

        <div className="mt-5 flex items-center justify-center gap-6">
          <div className="flex items-center gap-1.5 text-white/80">
            <Star className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-medium">{progress?.xp ?? 0} XP</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/80">
            <Flame className="h-4 w-4 text-orange-400" />
            <span className="text-sm font-medium">{progress?.streak ?? 0} day streak</span>
          </div>
        </div>
      </div>

      <LessonPath lessons={LESSONS} completedLessons={progress?.completedLessons ?? []} />
    </div>
  );
}
