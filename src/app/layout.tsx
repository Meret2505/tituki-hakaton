import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "BilimPortal - Bilim Web Programmasy",
  description: "Onlaýn kurslar we bilim mazmunlary",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tk" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50 font-sans">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
            <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
              © 2024 BilimPortal — Oguz Han Engineering and Technology University of Turkmenistan
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
