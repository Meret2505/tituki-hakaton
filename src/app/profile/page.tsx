import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      enrollments: {
        include: {
          course: {
            include: {
              category: true,
              _count: { select: { lessons: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) redirect("/auth/login");

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
          {user.name?.charAt(0).toUpperCase() ?? "U"}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-gray-500 text-sm">{user.email}</p>
          <span className={`mt-1 inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-50 text-blue-700"}`}>
            {user.role === "admin" ? "Administrator" : "Okuwçy"}
          </span>
        </div>
      </div>

      {/* Enrolled courses */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Ýazylan Kurslarym ({user.enrollments.length})
      </h2>

      {user.enrollments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <svg className="w-14 h-14 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-gray-500 mb-4">Heniz hiç bir kursa ýazylan dälsiňiz.</p>
          <Link
            href="/courses"
            className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Kurslara Göz At
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {user.enrollments.map((enrollment) => (
            <Link
              key={enrollment.id}
              href={`/courses/${enrollment.course.id}`}
              className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition group"
            >
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-blue-400 to-indigo-600 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">{enrollment.course.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  {enrollment.course.category && <span>{enrollment.course.category.name}</span>}
                  <span>{enrollment.course._count.lessons} sapak</span>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
