import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id: courseId, lessonId } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { course: true },
  });

  if (!lesson || lesson.courseId !== courseId) notFound();

  const allLessons = await prisma.lesson.findMany({
    where: { courseId, isPublished: true },
    orderBy: { order: "asc" },
    select: { id: true, title: true, order: true },
  });

  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link href={`/courses/${courseId}`} className="text-blue-600 text-sm hover:underline mb-6 inline-block">
        ← {lesson.course.title}
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Video */}
        {lesson.type === "video" && lesson.videoUrl && (
          <div className="aspect-video bg-black">
            {lesson.videoUrl.includes("youtube.com") || lesson.videoUrl.includes("youtu.be") ? (
              <iframe
                src={lesson.videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "www.youtube.com/embed/")}
                className="w-full h-full"
                allowFullScreen
              />
            ) : (
              <video src={lesson.videoUrl} controls className="w-full h-full" />
            )}
          </div>
        )}

        <div className="p-6 md:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{lesson.title}</h1>

          {/* Text content */}
          {lesson.content && (
            <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
              {lesson.content}
            </div>
          )}

          {/* File download */}
          {lesson.type === "file" && lesson.fileUrl && (
            <div className="mt-6">
              <a
                href={lesson.fileUrl}
                download
                className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2.5 rounded-lg hover:bg-blue-100 transition font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Faýly Ýükle
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Lesson navigation */}
      <div className="flex justify-between mt-6">
        {prevLesson ? (
          <Link
            href={`/courses/${courseId}/lessons/${prevLesson.id}`}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition text-sm font-medium text-gray-700"
          >
            ← Öňki sapak
          </Link>
        ) : <div />}
        {nextLesson ? (
          <Link
            href={`/courses/${courseId}/lessons/${nextLesson.id}`}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          >
            Indiki sapak →
          </Link>
        ) : (
          <Link
            href={`/courses/${courseId}`}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
          >
            Kursy Tamamla ✓
          </Link>
        )}
      </div>

      {/* Sidebar lesson list */}
      <div className="mt-8">
        <h3 className="font-semibold text-gray-900 mb-3">Ähli Sapaklar</h3>
        <div className="space-y-1">
          {allLessons.map((l, i) => (
            <Link
              key={l.id}
              href={`/courses/${courseId}/lessons/${l.id}`}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition ${
                l.id === lessonId
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs shrink-0 font-bold">
                {i + 1}
              </span>
              {l.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
