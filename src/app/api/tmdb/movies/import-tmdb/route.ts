import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/security/server";
import { getTmdbMovieDetails } from "@/features/admin/tmdb";
import { slugify } from "@/lib/utils";

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

type TmdbVideo = {
    site?: string;
    type?: string;
    official?: boolean;
    key?: string;
};

type TmdbVideosPayload = {
    results?: TmdbVideo[];
};

type TmdbGenre = {
    id: number;
    name: string;
};

function getTmdbImageUrl(path?: string | null, size = "w500") {
    if (!path) return null;

    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

function getYoutubeTrailerUrl(videos: TmdbVideosPayload | null | undefined) {
    const results = videos?.results || [];

    const trailer = results.find(
        (video) =>
        video.site === "YouTube" &&
        video.type === "Trailer" &&
        video.official === true
    );

    const fallbackTrailer = results.find(
        (video) => video.site === "YouTube" && video.type === "Trailer"
    );

    const selectedVideo = trailer || fallbackTrailer;

    if (!selectedVideo?.key) return null;

    return `https://www.youtube.com/watch?v=${selectedVideo.key}`;
}

export async function POST(request: NextRequest) {
    try {
        const auth = await requireAdmin(request);
        if (!auth.ok) return auth.response;

        const body = await request.json();
        const tmdbId = Number(body.tmdbId);

        if (!tmdbId) {
        return NextResponse.json(
            { message: "TMDB movie id is required" },
            { status: 400 }
        );
        }

        const existingMovie = await prisma.movie.findUnique({
        where: {
            tmdbId,
        },
        });

        if (existingMovie) {
        return NextResponse.json(
            { message: "This movie has already been imported." },
            { status: 409 }
        );
        }

        const tmdbMovie = await getTmdbMovieDetails(tmdbId);

        const title = tmdbMovie.title || tmdbMovie.original_title;

        if (!title) {
        return NextResponse.json(
            { message: "TMDB movie title is missing" },
            { status: 400 }
        );
        }

        const baseSlug = slugify(title);

        const duplicatedSlugMovie = await prisma.movie.findUnique({
        where: {
            slug: baseSlug,
        },
        });

        const slug = duplicatedSlugMovie ? `${baseSlug}-${tmdbId}` : baseSlug;

        const movie = await prisma.movie.create({
        data: {
            tmdbId,
            source: "TMDB",
            title,
            originalTitle: tmdbMovie.original_title || null,
            slug,
            description: tmdbMovie.overview || null,
            posterUrl: getTmdbImageUrl(tmdbMovie.poster_path, "w500"),
            backdropUrl: getTmdbImageUrl(tmdbMovie.backdrop_path, "w1280"),
            trailerUrl: getYoutubeTrailerUrl(tmdbMovie.videos),
            duration: tmdbMovie.runtime || null,
            releaseDate: tmdbMovie.release_date
            ? new Date(tmdbMovie.release_date)
            : null,
            originalLanguage: tmdbMovie.original_language || null,
            voteAverage: tmdbMovie.vote_average || null,
            voteCount: tmdbMovie.vote_count || null,
            popularity: tmdbMovie.popularity || null,
            status: "DRAFT",
            genres: {
            create: await Promise.all(
                ((tmdbMovie.genres || []) as TmdbGenre[]).map(async (genre) => {
                const genreName = genre.name;
                const genreSlug = slugify(genreName);

                const savedGenre = await prisma.genre.upsert({
                    where: {
                    tmdbId: genre.id,
                    },
                    update: {
                    name: genreName,
                    slug: genreSlug,
                    isActive: true,
                    },
                    create: {
                    tmdbId: genre.id,
                    name: genreName,
                    slug: genreSlug,
                    isActive: true,
                    },
                });

                return {
                    genre: {
                    connect: {
                        id: savedGenre.id,
                    },
                    },
                };
                })
            ),
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
            message: "Movie imported successfully",
            data: movie,
        },
        { status: 201 }
        );
    } catch (error) {
        console.error("IMPORT_TMDB_MOVIE_ERROR", error);

        return NextResponse.json(
        { message: "Failed to import TMDB movie" },
        { status: 500 }
        );
    }
}
