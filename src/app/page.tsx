import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CourseCard from "@/components/CourseCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    include: {
      category: true,
      _count: { select: { lessons: true, enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const totalCourses = await prisma.course.count({ where: { isPublished: true } });
  const totalUsers = await prisma.user.count();
  const totalLessons = await prisma.lesson.count({ where: { isPublished: true } });

  return (
    <div>
      {/* Hero */}
      <section className="bg-linear-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Bilime Açyk Gapylar
          </h1>
          <p className="text-blue-100 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Islendik ýerden, islendik wagtda öwreniň. Hünärmenlerimiziň taýýarlan kurslaryna ýazylyň.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/courses"
              className="bg-white text-blue-700 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition shadow-lg"
            >
              Kurslara Göz At
            </Link>
            <Link
              href="/auth/register"
              className="border-2 border-white text-white font-semibold px-8 py-3 rounded-xl hover:bg-white hover:text-blue-700 transition"
            >
              Mugt Hasaba Al
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600">{totalCourses}+</div>
            <div className="text-gray-500 mt-1">Kurs</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600">{totalLessons}+</div>
            <div className="text-gray-500 mt-1">Sapak</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600">{totalUsers}+</div>
            <div className="text-gray-500 mt-1">Okuwçy</div>
          </div>
        </div>
      </section>

      {/* Featured courses */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Soňky Kurslar</h2>
          <Link href="/courses" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            Hemmesini gör →
          </Link>
        </div>
        {courses.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            Häzir kurslar ýok. Administrator kurs goşandan soň bu ýerde görüner.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-blue-50 py-14 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Öwrenmäge Başlaň
          </h2>
          <p className="text-gray-500 mb-6">
            Mugt hasaba durup, müňlerçe sapakdan peýdalanyň.
          </p>
          <Link
            href="/auth/register"
            className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-700 transition inline-block"
          >
            Häzir Başla
          </Link>
        </div>
      </section>
    </div>
  );
}
