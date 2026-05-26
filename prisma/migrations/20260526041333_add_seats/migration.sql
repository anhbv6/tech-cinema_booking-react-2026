-- CreateEnum
CREATE TYPE "SeatType" AS ENUM ('NORMAL', 'VIP', 'COUPLE');

-- CreateTable
CREATE TABLE "Seat" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "row" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "type" "SeatType" NOT NULL DEFAULT 'NORMAL',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Seat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Seat_roomId_idx" ON "Seat"("roomId");

-- CreateIndex
CREATE INDEX "Seat_type_idx" ON "Seat"("type");

-- CreateIndex
CREATE INDEX "Seat_isActive_idx" ON "Seat"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Seat_roomId_row_number_key" ON "Seat"("roomId", "row", "number");

-- AddForeignKey
ALTER TABLE "Seat" ADD CONSTRAINT "Seat_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
