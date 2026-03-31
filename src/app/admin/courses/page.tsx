import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/");

  const courses = await prisma.course.findMany({
    include: {
      category: true,
      _count: { select: { lessons: true, enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin" className="text-blue-600 text-sm hover:underline">← Admin Panel</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Kurslar</h1>
        </div>
        <Link
          href="/admin/courses/new"
          className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
        >
          + Täze Kurs
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Ady</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium hidden md:table-cell">Kategoriýa</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium hidden md:table-cell">Sapaklar</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Ýagdaý</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{course.title}</td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{course.category?.name ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{course._count.lessons}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${course.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {course.isPublished ? "Çap edildi" : "Görünmeýär"}
                  </span>
                </td>
                <td className="px-4 py-3 flex items-center gap-3">
                  <Link href={`/admin/courses/${course.id}/edit`} className="text-blue-600 hover:underline text-xs font-medium">
                    Düzelt
                  </Link>
                  <Link href={`/admin/courses/${course.id}/lessons/new`} className="text-green-600 hover:underline text-xs font-medium">
                    + Sapak
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {courses.length === 0 && (
          <div className="text-center py-12 text-gray-400">Kurs ýok. Täze kurs goşuň.</div>
        )}
      </div>
    </div>
  );
}
