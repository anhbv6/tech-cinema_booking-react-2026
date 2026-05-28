import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/security/server";
import { createGenreSchema } from "@/features/genres/schemas/genre.schema";
import { slugify } from "@/lib/utils";


export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

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
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

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

