"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Lesson {
  id: string;
  title: string;
  type: string;
  order: number;
}

interface Course {
  id: string;
  title: string;
  description?: string | null;
  thumbnail?: string | null;
  category?: { name: string } | null;
  lessons: Lesson[];
  _count: { enrollments: number };
}

export default function CoursePage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetch(`/api/courses/${id}`)
      .then((r) => r.json())
      .then((data) => { setCourse(data); setLoading(false); });

    if (session?.user) {
      fetch("/api/profile")
        .then((r) => r.json())
        .then((profile) => {
          const isEnrolled = profile?.enrollments?.some(
            (e: { courseId: string }) => e.courseId === id
          );
          setEnrolled(isEnrolled);
        });
    }
  }, [id, session]);

  async function handleEnroll() {
    if (!session) return;
    setEnrolling(true);
    const method = enrolled ? "DELETE" : "POST";
    await fetch(`/api/courses/${id}/enroll`, { method });
    setEnrolled(!enrolled);
    setEnrolling(false);
    setCourse((prev) =>
      prev
        ? {
            ...prev,
            _count: {
              ...prev._count,
              enrollments: prev._count.enrollments + (enrolled ? -1 : 1),
            },
          }
        : prev
    );
  }

  const typeIcon = (type: string) => {
    if (type === "video") return "🎥";
    if (type === "file") return "📄";
    return "📝";
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
        <div className="h-8 bg-gray-200 rounded w-2/3 animate-pulse" />
        <div className="h-48 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!course) {
    return <div className="text-center py-20 text-gray-400">Kurs tapylmady.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link href="/courses" className="text-blue-600 text-sm hover:underline mb-4 inline-block">
        ← Kurslara gaýt
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mb-6">
        {course.thumbnail && (
          <img src={course.thumbnail} alt={course.title} className="w-full h-56 object-cover" />
        )}
        <div className="p-6">
          {course.category && (
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              {course.category.name}
            </span>
          )}
          <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-2">{course.title}</h1>
          {course.description && (
            <p className="text-gray-600 mb-4">{course.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-5">
            <span>{course.lessons.length} sapak</span>
            <span>{course._count.enrollments} okuwçy</span>
          </div>

          {session ? (
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className={`px-6 py-2.5 rounded-lg font-semibold transition ${
                enrolled
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              } disabled:opacity-60`}
            >
              {enrolling ? "..." : enrolled ? "Ýazylmany Ýatyr" : "Kursa Ýazyl"}
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Ýazylmak üçin giriş ediň
            </Link>
          )}
        </div>
      </div>

      {/* Lessons list */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">Sapaklar</h2>
      {course.lessons.length === 0 ? (
        <div className="text-center text-gray-400 py-10">Sapak goşulmandyr.</div>
      ) : (
        <div className="space-y-2">
          {course.lessons.map((lesson, index) => (
            <Link
              key={lesson.id}
              href={`/courses/${course.id}/lessons/${lesson.id}`}
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition group"
            >
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-sm font-bold text-blue-600 shrink-0">
                {index + 1}
              </div>
              <span className="flex-1 text-gray-800 font-medium group-hover:text-blue-600">{lesson.title}</span>
              <span className="text-lg">{typeIcon(lesson.type)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
