import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { createGenreSchema } from "@/features/genres/schemas/genre.schema";

const adminRoles = ["ADMIN", "MANAGER", "STAFF"];

async function checkAdminPermission() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return false;
  }

  return adminRoles.includes(session.user.role);
}


export async function GET() {
  const isAllowed = await checkAdminPermission();

  if (!isAllowed) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const genres = await prisma.genre.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json({
    data: genres,
  });
}


export async function POST(request: NextRequest) {
  const isAllowed = await checkAdminPermission();

  if (!isAllowed) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
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

  const existingGenre = await prisma.genre.findFirst({
    where: {
      OR: [{ name }, { slug }],
    },
  });

  if (existingGenre) {
    return NextResponse.json(
      { message: "This genre already exists." },
      { status: 409 }
    );
  }

  const genre = await prisma.genre.create({
    data: {
      name,
      slug,
      description,
    },
  });

  return NextResponse.json(
    {
      message: "Create successful genres.",
      data: genre,
    },
    { status: 201 }
  );
}

