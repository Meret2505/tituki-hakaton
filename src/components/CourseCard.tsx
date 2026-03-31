import Link from "next/link";

interface CourseCardProps {
  id: string;
  title: string;
  description?: string | null;
  thumbnail?: string | null;
  category?: { name: string } | null;
  _count?: { lessons: number; enrollments: number };
}

export default function CourseCard({ id, title, description, thumbnail, category, _count }: CourseCardProps) {
  return (
    <Link href={`/courses/${id}`} className="group block bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition overflow-hidden">
      <div className="h-44 bg-linear-to-br from-blue-400 to-indigo-600 relative overflow-hidden">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}
        {category && (
          <span className="absolute top-3 left-3 bg-white bg-opacity-90 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
            {category.name}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition line-clamp-2">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-gray-500 text-sm line-clamp-2">{description}</p>
        )}
        <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {_count?.lessons ?? 0} sapak
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {_count?.enrollments ?? 0} okuwçy
          </span>
        </div>
      </div>
    </Link>
  );
}
