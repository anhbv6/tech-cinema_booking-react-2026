// src/app/api/genres/[id]/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { createGenreSchema } from "@/features/genres/schemas/genre.schema";
import { slugify } from "@/lib/slug";

const adminRoles = ["ADMIN", "MANAGER", "STAFF"];

async function checkAdminPermission() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return false;
  }

  return adminRoles.includes(session.user.role);
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const isAllowed = await checkAdminPermission();

    if (!isAllowed) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { message: "Missing genre id" },
        { status: 400 }
      );
    }

    const existingGenre = await prisma.genre.findUnique({
      where: { id },
    });

    if (!existingGenre) {
      return NextResponse.json(
        { message: "Genre không tồn tại" },
        { status: 404 }
      );
    }

    await prisma.genre.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Xóa thể loại thành công",
    });
  } catch (error) {
    console.error("DELETE_GENRE_ERROR", error);

    return NextResponse.json(
      { message: "Xóa thể loại thất bại" },
      { status: 500 }
    );
  }
}


export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const isAllowed = await checkAdminPermission();

    if (!isAllowed) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { message: "Missing genre id" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const parsed = createGenreSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid input",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const name = parsed.data.name.trim();
    const description = parsed.data.description?.trim() || null;
    const slug = slugify(name);

    const existingGenre = await prisma.genre.findUnique({
      where: { id },
    });

    if (!existingGenre) {
      return NextResponse.json(
        { message: "Genre not found" },
        { status: 404 }
      );
    }

    const duplicatedGenre = await prisma.genre.findFirst({
      where: {
        id: {
          not: id,
        },
        OR: [{ name }, { slug }],
      },
    });

    if (duplicatedGenre) {
      return NextResponse.json(
        { message: "This genre already exists." },
        { status: 409 }
      );
    }

    const updatedGenre = await prisma.genre.update({
      where: { id },
      data: {
        name,
        slug,
        description,
      },
    });

    return NextResponse.json({
      message: "Genre updated successfully",
      data: updatedGenre,
    });
  } catch (error) {
    console.error("UPDATE_GENRE_ERROR", error);

    return NextResponse.json(
      { message: "Failed to update genre" },
      { status: 500 }
    );
  }
}