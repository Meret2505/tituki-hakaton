"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            BilimPortal
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/courses" className="text-gray-600 hover:text-blue-600 font-medium transition">
              Kurslar
            </Link>
            {session?.user ? (
              <>
                <Link href="/profile" className="text-gray-600 hover:text-blue-600 font-medium transition">
                  Profil
                </Link>
                {session.user.role === "admin" && (
                  <Link href="/admin" className="text-gray-600 hover:text-blue-600 font-medium transition">
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm font-medium"
                >
                  Çykyş
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-600 hover:text-blue-600 font-medium transition"
                >
                  Giriş
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                >
                  Hasaba Al
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/courses" className="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded" onClick={() => setMenuOpen(false)}>
              Kurslar
            </Link>
            {session?.user ? (
              <>
                <Link href="/profile" className="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded" onClick={() => setMenuOpen(false)}>
                  Profil
                </Link>
                {session.user.role === "admin" && (
                  <Link href="/admin" className="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded" onClick={() => setMenuOpen(false)}>
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                  className="block w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100 rounded"
                >
                  Çykyş
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded" onClick={() => setMenuOpen(false)}>
                  Giriş
                </Link>
                <Link href="/auth/register" className="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded" onClick={() => setMenuOpen(false)}>
                  Hasaba Al
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
