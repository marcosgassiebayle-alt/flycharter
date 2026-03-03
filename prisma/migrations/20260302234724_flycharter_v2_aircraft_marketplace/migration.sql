/*
  Warnings:

  - You are about to drop the column `arrivalAt` on the `FlightLeg` table. All the data in the column will be lost.
  - You are about to drop the column `offerId` on the `FlightLeg` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "FlightLeg" DROP CONSTRAINT "FlightLeg_offerId_fkey";

-- DropIndex
DROP INDEX "FlightLeg_offerId_legOrder_idx";

-- AlterTable
ALTER TABLE "Aircraft" ADD COLUMN     "baseAirport" TEXT NOT NULL DEFAULT 'SFN',
ADD COLUMN     "baseAirportName" TEXT NOT NULL DEFAULT 'San Fernando',
ADD COLUMN     "baseLat" DOUBLE PRECISION,
ADD COLUMN     "baseLng" DOUBLE PRECISION,
ADD COLUMN     "cruiseSpeedKmh" INTEGER NOT NULL DEFAULT 600,
ADD COLUMN     "hourlyRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "minBookingHours" DOUBLE PRECISION NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "aircraftId" TEXT;

-- AlterTable
ALTER TABLE "FlightLeg" DROP COLUMN "arrivalAt",
DROP COLUMN "offerId",
ADD COLUMN     "bookingId" TEXT,
ADD COLUMN     "distanceKm" DOUBLE PRECISION,
ADD COLUMN     "estimatedDurationMin" INTEGER;

-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "availableSeats" INTEGER,
ADD COLUMN     "discountLabel" TEXT,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "isLastMinute" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSharedFlight" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "originalPrice" DOUBLE PRECISION,
ADD COLUMN     "pricePerSeat" DOUBLE PRECISION,
ADD COLUMN     "urgencyLevel" TEXT;

-- CreateTable
CREATE TABLE "AircraftBlockedDate" (
    "id" TEXT NOT NULL,
    "aircraftId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AircraftBlockedDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AircraftLocation" (
    "id" TEXT NOT NULL,
    "aircraftId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "airportCode" TEXT NOT NULL,
    "airportName" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AircraftLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AircraftBlockedDate_aircraftId_idx" ON "AircraftBlockedDate"("aircraftId");

-- CreateIndex
CREATE UNIQUE INDEX "AircraftBlockedDate_aircraftId_date_key" ON "AircraftBlockedDate"("aircraftId", "date");

-- CreateIndex
CREATE INDEX "AircraftLocation_aircraftId_date_idx" ON "AircraftLocation"("aircraftId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "AircraftLocation_aircraftId_date_key" ON "AircraftLocation"("aircraftId", "date");

-- CreateIndex
CREATE INDEX "FlightLeg_bookingId_legOrder_idx" ON "FlightLeg"("bookingId", "legOrder");

-- AddForeignKey
ALTER TABLE "AircraftBlockedDate" ADD CONSTRAINT "AircraftBlockedDate_aircraftId_fkey" FOREIGN KEY ("aircraftId") REFERENCES "Aircraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AircraftLocation" ADD CONSTRAINT "AircraftLocation_aircraftId_fkey" FOREIGN KEY ("aircraftId") REFERENCES "Aircraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_aircraftId_fkey" FOREIGN KEY ("aircraftId") REFERENCES "Aircraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlightLeg" ADD CONSTRAINT "FlightLeg_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
