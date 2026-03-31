import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id: courseId } = await params;
  const body = await req.json();

  const lesson = await prisma.lesson.create({
    data: {
      title: body.title,
      content: body.content,
      videoUrl: body.videoUrl,
      fileUrl: body.fileUrl,
      type: body.type || "text",
      order: body.order || 0,
      courseId,
      isPublished: body.isPublished ?? false,
    },
  });

  return NextResponse.json(lesson, { status: 201 });
}
