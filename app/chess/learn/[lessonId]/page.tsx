import { notFound } from "next/navigation";
import { LessonPlayer } from "@/components/chess/lesson-player";
import { getLessonById, getLessonIndex, LESSONS } from "@/lib/chess/lessons";

interface LessonPageProps {
  params: Promise<{ lessonId: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonId } = await params;
  const lesson = getLessonById(lessonId);
  if (!lesson) notFound();

  const nextLesson = LESSONS[getLessonIndex(lessonId) + 1];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">{lesson.title}</h1>
        <p className="text-white/60">{lesson.description}</p>
      </div>
      <LessonPlayer lesson={lesson} nextLesson={nextLesson} />
    </div>
  );
}
