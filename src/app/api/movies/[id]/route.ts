import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/security/server";
import { createMovieSchema } from "@/features/admin/movies";
import { slugify } from "@/lib/utils";

    export async function PATCH(
    request: Request,
    context: { params: Promise<{ id: string }> }
    ) {
    try {
        const auth = await requireAdmin(request);
        if (!auth.ok) return auth.response;

        const { id } = await context.params;

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

        const existingMovie = await prisma.movie.findUnique({
        where: { id },
        });

        if (!existingMovie) {
        return NextResponse.json(
            { message: "Movie not found" },
            { status: 404 }
        );
        }

        const title = parsed.data.title.trim();
        const slug = slugify(title);

        const duplicatedMovie = await prisma.movie.findFirst({
        where: {
            id: {
            not: id,
            },
            slug,
        },
        });

        if (duplicatedMovie) {
        return NextResponse.json(
            { message: "This movie already exists." },
            { status: 409 }
        );
        }

        const updatedMovie = await prisma.$transaction(async (tx) => {
        await tx.movieGenre.deleteMany({
            where: {
            movieId: id,
            },
        });

        return tx.movie.update({
            where: { id },
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
        });

        return NextResponse.json({
        message: "Movie updated successfully",
        data: updatedMovie,
        });
    } catch (error) {
        console.error("UPDATE_MOVIE_ERROR", error);

        return NextResponse.json(
        { message: "Failed to update movie" },
        { status: 500 }
        );
    }
    }

    export async function DELETE(
    request: Request,
    context: { params: Promise<{ id: string }> }
    ) {
    try {
        const auth = await requireAdmin(request);
        if (!auth.ok) return auth.response;

        const { id } = await context.params;

        const existingMovie = await prisma.movie.findUnique({
        where: { id },
        });

        if (!existingMovie) {
        return NextResponse.json(
            { message: "Movie not found" },
            { status: 404 }
        );
        }

        await prisma.movie.delete({
        where: { id },
        });

        return NextResponse.json({
        message: "Movie deleted successfully",
        });
    } catch (error) {
        console.error("DELETE_MOVIE_ERROR", error);

        return NextResponse.json(
        { message: "Failed to delete movie" },
        { status: 500 }
        );
    }
}
