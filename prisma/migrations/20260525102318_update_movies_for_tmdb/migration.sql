/*
  Warnings:

  - A unique constraint covering the columns `[tmdbId]` on the table `Genre` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tmdbId]` on the table `Movie` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "MovieSource" AS ENUM ('MANUAL', 'TMDB');

-- AlterTable
ALTER TABLE "Genre" ADD COLUMN     "tmdbId" INTEGER;

-- AlterTable
ALTER TABLE "Movie" ADD COLUMN     "backdropUrl" TEXT,
ADD COLUMN     "originalLanguage" TEXT,
ADD COLUMN     "originalTitle" TEXT,
ADD COLUMN     "popularity" DOUBLE PRECISION,
ADD COLUMN     "source" "MovieSource" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "tmdbId" INTEGER,
ADD COLUMN     "voteAverage" DOUBLE PRECISION,
ADD COLUMN     "voteCount" INTEGER,
ALTER COLUMN "duration" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Genre_tmdbId_key" ON "Genre"("tmdbId");

-- CreateIndex
CREATE INDEX "Genre_isActive_idx" ON "Genre"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Movie_tmdbId_key" ON "Movie"("tmdbId");

-- CreateIndex
CREATE INDEX "Movie_status_idx" ON "Movie"("status");

-- CreateIndex
CREATE INDEX "Movie_isActive_idx" ON "Movie"("isActive");

-- CreateIndex
CREATE INDEX "Movie_source_idx" ON "Movie"("source");

-- CreateIndex
CREATE INDEX "Movie_releaseDate_idx" ON "Movie"("releaseDate");

-- CreateIndex
CREATE INDEX "MovieGenre_genreId_idx" ON "MovieGenre"("genreId");
