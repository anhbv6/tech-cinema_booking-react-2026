import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/security/server";
import { createMovieSchema } from "@/features/movies/schemas/movie.schema";
import { slugify } from "@/lib/utils";

export async function GET(request: NextRequest) {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const movies = await prisma.movie.findMany({
        orderBy: {
        createdAt: "desc",
        },
        include: {
        genres: {
            include: {
            genre: true,
            },
        },
        },
    });

    return NextResponse.json({
        data: movies,
    });
    }

    export async function POST(request: NextRequest) {
    try {
        const auth = await requireAdmin(request);
        if (!auth.ok) return auth.response;

        const body = await request.json();

        const parsed = createMovieSchema.safeParse(body);

        if (!parsed.success) {
        return NextResponse.json(
            {
            message: "Invalid input",
            errors: parsed.error.flatten().fieldErrors,
            },
            { status: 400 }
        );
        }

        const title = parsed.data.title.trim();
        const slug = slugify(title);

        const existingMovie = await prisma.movie.findUnique({
        where: {
            slug,
        },
        });

        if (existingMovie) {
        return NextResponse.json(
            { message: "This movie already exists." },
            { status: 409 }
        );
        }

        const movie = await prisma.movie.create({
        data: {
            title,
            slug,
            description: parsed.data.description?.trim() || null,
            posterUrl: parsed.data.posterUrl?.trim() || null,
            trailerUrl: parsed.data.trailerUrl?.trim() || null,
            duration: parsed.data.duration,
            releaseDate: parsed.data.releaseDate
            ? new Date(parsed.data.releaseDate)
            : null,
            status: parsed.data.status,
            genres: {
            create: parsed.data.genreIds.map((genreId) => ({
                genre: {
                connect: {
                    id: genreId,
                },
                },
            })),
            },
        },
        include: {
            genres: {
            include: {
                genre: true,
            },
            },
        },
        });

        return NextResponse.json(
        {
            message: "Movie created successfully",
            data: movie,
        },
        { status: 201 }
        );
    } catch (error) {
        console.error("CREATE_MOVIE_ERROR", error);

        return NextResponse.json(
        { message: "Failed to create movie" },
        { status: 500 }
        );
    }
}
