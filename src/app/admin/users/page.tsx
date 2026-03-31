import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/");

  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, role: true, createdAt: true,
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Link href="/admin" className="text-blue-600 text-sm hover:underline mb-4 inline-block">← Admin Panel</Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Ulanyjylar</h1>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Ady</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">E-poçta</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium hidden md:table-cell">Roly</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium hidden md:table-cell">Ýazylanlar</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium hidden md:table-cell">Goşulan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{user.name ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500">{user.email}</td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-50 text-blue-700"}`}>
                    {user.role === "admin" ? "Admin" : "Okuwçy"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{user._count.enrollments}</td>
                <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                  {new Date(user.createdAt).toLocaleDateString("tk-TM")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-12 text-gray-400">Ulanyjy ýok.</div>
        )}
      </div>
    </div>
  );
}
