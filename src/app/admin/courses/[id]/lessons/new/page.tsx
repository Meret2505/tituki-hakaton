"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function NewLessonPage() {
  const { id: courseId } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState({
    title: "", content: "", videoUrl: "", fileUrl: "",
    type: "text", order: 0, isPublished: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/courses/${courseId}/lessons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) { setError("Sapak goşmak başartmady."); setLoading(false); return; }
    router.push(`/admin/courses/${courseId}/edit`);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href={`/admin/courses/${courseId}/edit`} className="text-blue-600 text-sm hover:underline mb-4 inline-block">
        ← Kursa gaýt
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Täze Sapak Goş</h1>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ady *</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Sapagyň ady"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Görnüşi</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 bg-white"
          >
            <option value="text">Tekst</option>
            <option value="video">Wideo</option>
            <option value="file">Faýl</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mazmuny (tekst)</label>
          <textarea
            rows={6}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 resize-none"
            placeholder="Sapagyň mazmuny..."
          />
        </div>
        {(form.type === "video") && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Wideo URL</label>
            <input
              value={form.videoUrl}
              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
        )}
        {(form.type === "file") && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Faýl URL</label>
            <input
              value={form.fileUrl}
              onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="https://..."
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tertip belgisi</label>
          <input
            type="number"
            value={form.order}
            onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isPublished"
            checked={form.isPublished}
            onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
            className="w-4 h-4 accent-blue-600"
          />
          <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">Çap et</label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60"
        >
          {loading ? "Goşulýar..." : "Sapak Goş"}
        </button>
      </form>
    </div>
  );
}
