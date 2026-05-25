import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { getTmdbMovieDetails } from "@/features/tmdb/services/tmdb.service";

const adminRoles = ["ADMIN", "MANAGER", "STAFF"];

async function checkAdminPermission() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return false;
  }

  return adminRoles.includes(session.user.role);
}

export async function GET(
    request: Request,
    context: { params: Promise<{ tmdbId: string }> }
) {
    try {
        const isAllowed = await checkAdminPermission();

        if (!isAllowed) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
        }

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