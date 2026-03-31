"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Category { id: string; name: string }
interface Lesson { id: string; title: string; type: string; order: number; isPublished: boolean }

export default function EditCoursePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [form, setForm] = useState({
    title: "", description: "", thumbnail: "", categoryId: "", isPublished: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/courses/${id}`).then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([course, cats]) => {
      setForm({
        title: course.title,
        description: course.description || "",
        thumbnail: course.thumbnail || "",
        categoryId: course.categoryId || "",
        isPublished: course.isPublished,
      });
      setLessons(course.lessons || []);
      setCategories(cats);
      setLoading(false);
    });
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch(`/api/courses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) { setError("Saklamak başartmady."); return; }
    router.push("/admin/courses");
  }

  async function handleDelete() {
    if (!confirm("Bu kursy pozmak isleýärsiňizmi?")) return;
    setDeleting(true);
    await fetch(`/api/courses/${id}`, { method: "DELETE" });
    router.push("/admin/courses");
  }

  async function deleteLesson(lessonId: string) {
    if (!confirm("Bu sapak pozulsyn?")) return;
    await fetch(`/api/lessons/${lessonId}`, { method: "DELETE" });
    setLessons(lessons.filter((l) => l.id !== lessonId));
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Ýüklenýär...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link href="/admin/courses" className="text-blue-600 text-sm hover:underline mb-4 inline-block">
        ← Kurslara gaýt
      </Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kursy Düzelt</h1>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm hover:bg-red-50 transition font-medium"
        >
          {deleting ? "Pozulýar..." : "Kursy Poz"}
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{error}</div>}

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ady *</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Beýany</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Surat URL</label>
          <input
            value={form.thumbnail}
            onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kategoriýa</label>
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 bg-white"
          >
            <option value="">Kategoriýasyz</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
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
          disabled={saving}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60"
        >
          {saving ? "Saklanýar..." : "Sakla"}
        </button>
      </form>

      {/* Lessons */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Sapaklar ({lessons.length})</h2>
        <Link
          href={`/admin/courses/${id}/lessons/new`}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition"
        >
          + Sapak Goş
        </Link>
      </div>

      {lessons.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
          Sapak ýok. Täze sapak goşuň.
        </div>
      ) : (
        <div className="space-y-2">
          {lessons.map((lesson, i) => (
            <div key={lesson.id} className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4">
              <span className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
              <span className="flex-1 font-medium text-gray-800">{lesson.title}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${lesson.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {lesson.isPublished ? "Çap edildi" : "Görünmeýär"}
              </span>
              <button
                onClick={() => deleteLesson(lesson.id)}
                className="text-red-500 hover:text-red-700 text-xs font-medium"
              >
                Poz
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
