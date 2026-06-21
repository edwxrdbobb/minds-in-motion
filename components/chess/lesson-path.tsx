"use client";

import Link from "next/link";
import {
  ChevronUp,
  Minus,
  X,
  Shuffle,
  Crown,
  ShieldAlert,
  Sparkles,
  Flag,
  Swords,
  Trophy,
  Lock,
  Check,
  type LucideIcon,
} from "lucide-react";
import type { Lesson } from "@/lib/chess/lessons";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  ChevronUp,
  Minus,
  X,
  Shuffle,
  Crown,
  ShieldAlert,
  Sparkles,
  Flag,
  Swords,
  Trophy,
};

const WIGGLE = [0, 32, 56, 32, 0, -32, -56, -32];

interface LessonPathProps {
  lessons: Lesson[];
  completedLessons: string[];
}

export function LessonPath({ lessons, completedLessons }: LessonPathProps) {
  return (
    <div className="mx-auto flex max-w-xs flex-col items-center gap-3 py-4">
      {lessons.map((lesson, index) => {
        const isCompleted = completedLessons.includes(lesson.id);
        const isAvailable = index === 0 || completedLessons.includes(lessons[index - 1].id);
        const Icon = ICONS[lesson.icon] ?? Sparkles;
        const offset = WIGGLE[index % WIGGLE.length];

        const node = (
          <div
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-full border-2 transition-transform",
              isCompleted && "border-emerald-400/60 bg-emerald-500/20 text-emerald-300",
              !isCompleted && isAvailable && "border-primary/60 bg-primary/15 text-primary animate-pulse-glow",
              !isAvailable && "border-border bg-muted text-muted-foreground",
              isAvailable && "hover:scale-105",
            )}
          >
            {isCompleted ? <Check className="h-6 w-6" /> : !isAvailable ? <Lock className="h-5 w-5" /> : <Icon className="h-6 w-6" />}
          </div>
        );

        return (
          <div key={lesson.id} className="flex flex-col items-center gap-2" style={{ transform: `translateX(${offset}px)` }}>
            {isAvailable ? (
              <Link href={`/chess/learn/${lesson.id}`} className="flex flex-col items-center gap-2">
                {node}
                <div className="w-32 text-center">
                  <p className="text-xs font-medium text-foreground">{lesson.title}</p>
                </div>
              </Link>
            ) : (
              <div className="flex flex-col items-center gap-2 opacity-60">
                {node}
                <div className="w-32 text-center">
                  <p className="text-xs font-medium text-foreground">{lesson.title}</p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
