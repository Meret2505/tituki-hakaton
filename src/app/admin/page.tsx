import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/");

  const [totalCourses, totalUsers, totalLessons, totalEnrollments] = await Promise.all([
    prisma.course.count(),
    prisma.user.count(),
    prisma.lesson.count(),
    prisma.enrollment.count(),
  ]);

  const recentCourses = await prisma.course.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      _count: { select: { lessons: true, enrollments: true } },
    },
  });

  const stats = [
    { label: "Kurslar", value: totalCourses, href: "/admin/courses", color: "blue" },
    { label: "Ulanyjylar", value: totalUsers, href: "/admin/users", color: "green" },
    { label: "Sapaklar", value: totalLessons, href: "#", color: "purple" },
    { label: "Ýazylanlar", value: totalEnrollments, href: "#", color: "orange" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-1">Bilim portalyny dolandyryň</p>
        </div>
        <Link
          href="/admin/courses/new"
          className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
        >
          + Kurs Goş
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition">
            <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
          </Link>
        ))}
      </div>

      {/* Recent courses */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">Soňky Kurslar</h2>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Ady</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium hidden md:table-cell">Kategoriýa</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium hidden md:table-cell">Sapaklar</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium hidden md:table-cell">Ýazylanlar</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Ýagdaý</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {recentCourses.map((course) => (
              <tr key={course.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{course.title}</td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{course.category?.name ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{course._count.lessons}</td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{course._count.enrollments}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${course.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {course.isPublished ? "Çap edildi" : "Görünmeýär"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/courses/${course.id}/edit`}
                    className="text-blue-600 hover:underline text-xs font-medium"
                  >
                    Düzelt
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-gray-100">
          <Link href="/admin/courses" className="text-blue-600 text-sm hover:underline">
            Ähli kurslary gör →
          </Link>
        </div>
      </div>
    </div>
  );
}
