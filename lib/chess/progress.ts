import type { Difficulty, PlayerColor } from "./utils";

export interface LearnProgress {
  completedLessons: string[];
  completedSteps: Record<string, number>;
  xp: number;
  streak: number;
  lastVisit: string | null;
}

export interface PlayPrefs {
  difficulty: Difficulty;
  playerColor: PlayerColor;
}

const LEARN_KEY = "mim-chess-learn-progress";
const PLAY_KEY = "mim-chess-play-prefs";

const DEFAULT_LEARN: LearnProgress = {
  completedLessons: [],
  completedSteps: {},
  xp: 0,
  streak: 0,
  lastVisit: null,
};

const DEFAULT_PLAY: PlayPrefs = {
  difficulty: "intermediate",
  playerColor: "w",
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getLearnProgress(): LearnProgress {
  return readJson(LEARN_KEY, DEFAULT_LEARN);
}

export function saveLearnProgress(progress: LearnProgress): void {
  writeJson(LEARN_KEY, progress);
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayKey(): string {
  return new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
}

/** Marks a lesson step complete, awards XP, and bumps the daily streak. Returns the updated progress. */
export function recordStepComplete(lessonId: string, stepIndex: number, xpEarned: number): LearnProgress {
  const current = getLearnProgress();
  const today = todayKey();

  let streak = current.streak;
  if (current.lastVisit !== today) {
    streak = current.lastVisit === yesterdayKey() ? current.streak + 1 : 1;
  }

  const bestStepReached = Math.max(current.completedSteps[lessonId] ?? -1, stepIndex);

  const next: LearnProgress = {
    completedLessons: current.completedLessons,
    completedSteps: { ...current.completedSteps, [lessonId]: bestStepReached },
    xp: current.xp + xpEarned,
    streak,
    lastVisit: today,
  };

  saveLearnProgress(next);
  return next;
}

export function recordLessonComplete(lessonId: string): LearnProgress {
  const current = getLearnProgress();
  if (current.completedLessons.includes(lessonId)) return current;

  const next: LearnProgress = {
    ...current,
    completedLessons: [...current.completedLessons, lessonId],
  };
  saveLearnProgress(next);
  return next;
}

export function getPlayPrefs(): PlayPrefs {
  return readJson(PLAY_KEY, DEFAULT_PLAY);
}

export function savePlayPrefs(prefs: PlayPrefs): void {
  writeJson(PLAY_KEY, prefs);
}
