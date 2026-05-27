import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/security/server";
import { searchTmdbMovies } from "@/features/tmdb/services/tmdb.service";

export async function GET(request: NextRequest) {
    try {
        const auth = await requireAdmin(request);
        if (!auth.ok) return auth.response;

        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get("query");
        const page = Number(searchParams.get("page") || 1);

        if (!query?.trim()) {
        return NextResponse.json(
            { message: "Search query is required" },
            { status: 400 }
        );
        }

        const data = await searchTmdbMovies(query.trim(), page);

        return NextResponse.json({
        data,
        });
    } catch (error) {
        console.error("SEARCH_TMDB_MOVIES_ERROR", error);

        return NextResponse.json(
        { message: "Failed to search TMDB movies" },
        { status: 500 }
        );
    }
}
