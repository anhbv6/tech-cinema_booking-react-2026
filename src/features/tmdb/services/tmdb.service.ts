import axios from "axios";

const tmdbClient = axios.create({
    baseURL: process.env.TMDB_API_BASE_URL,
    headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
        accept: "application/json",
    },
});

export async function searchTmdbMovies(query: string, page = 1) {
    const res = await tmdbClient.get("/search/movie", {
        params: {
            query,
            page,
            language: "vi-VN",
            // include_adult: "false",
        }
    });

    return res.data;
}

export async function getTmdbMovieDetails(tmdbId: number) {
    const res = await tmdbClient.get(`/movie/${tmdbId}`, {
        params: {
        language: "vi-VN",
        append_to_response: "videos,credits,release_dates",
        },
    });

    return res.data;
}

export async function getTmdbConfiguration() {
    const res = await tmdbClient.get("/configuration");

    return res.data;
}