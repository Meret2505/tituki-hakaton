import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";

  const courses = await prisma.course.findMany({
    where: {
      isPublished: true,
      ...(search && { title: { contains: search } }),
      ...(category && { categoryId: category }),
    },
    include: {
      category: true,
      _count: { select: { lessons: true, enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(courses);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const course = await prisma.course.create({
    data: {
      title: body.title,
      description: body.description,
      thumbnail: body.thumbnail,
      categoryId: body.categoryId || null,
      isPublished: body.isPublished ?? false,
    },
  });

  return NextResponse.json(course, { status: 201 });
}
