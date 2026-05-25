import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { searchTmdbMovies } from "@/features/tmdb/services/tmdb.service";

const adminRoles = ["ADMIN", "MANAGER", "STAFF"];

async function checkAdminPermission() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return false;
  }

  return adminRoles.includes(session.user.role);
}

export async function GET(request: NextRequest) {
    try {
        const isAllowed = await checkAdminPermission();

        if (!isAllowed) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
        }

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