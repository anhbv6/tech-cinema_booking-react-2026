import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/security/server";
import { getTmdbMovieDetails } from "@/features/tmdb/services/tmdb.service";

export async function GET(
    request: Request,
    context: { params: Promise<{ tmdbId: string }> }
) {
    try {
        const auth = await requireAdmin(request);
        if (!auth.ok) return auth.response;

        const { tmdbId } = await context.params;
        const id = Number(tmdbId);

        if (!id) {
        return NextResponse.json(
            { message: "Invalid TMDB movie id" },
            { status: 400 }
        );
        }

        const data = await getTmdbMovieDetails(id);

        return NextResponse.json({
        data,
        });
    } catch (error) {
        console.error("GET_TMDB_MOVIE_DETAILS_ERROR", error);

        return NextResponse.json(
        { message: "Failed to get TMDB movie details" },
        { status: 500 }
        );
    }
}
