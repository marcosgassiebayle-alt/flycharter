-- CreateTable
CREATE TABLE "FlightLeg" (
    "id" TEXT NOT NULL,
    "offerId" TEXT,
    "requestId" TEXT,
    "legOrder" INTEGER NOT NULL,
    "origin" TEXT NOT NULL,
    "originCode" TEXT,
    "destination" TEXT NOT NULL,
    "destinationCode" TEXT,
    "departureAt" TIMESTAMP(3) NOT NULL,
    "arrivalAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FlightLeg_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FlightLeg_offerId_legOrder_idx" ON "FlightLeg"("offerId", "legOrder");

-- CreateIndex
CREATE INDEX "FlightLeg_requestId_legOrder_idx" ON "FlightLeg"("requestId", "legOrder");

-- AddForeignKey
ALTER TABLE "FlightLeg" ADD CONSTRAINT "FlightLeg_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlightLeg" ADD CONSTRAINT "FlightLeg_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "FlightRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
