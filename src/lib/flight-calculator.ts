// Haversine distance between two lat/lng points (returns km)
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Estimate flight duration in minutes (includes 15min taxi/takeoff/landing overhead)
export function estimateFlightDuration(distanceKm: number, cruiseSpeedKmh: number): number {
  return Math.ceil((distanceKm / cruiseSpeedKmh) * 60) + 15;
}

// Round price up to nearest 100
function roundToHundred(price: number): number {
  return Math.ceil(price / 100) * 100;
}

// Calculate price for a single leg
export function calculateLegPrice(
  originLat: number, originLng: number,
  destLat: number, destLng: number,
  cruiseSpeedKmh: number,
  hourlyRate: number
): { distanceKm: number; durationMin: number; durationHours: number; price: number } {
  const distanceKm = calculateDistance(originLat, originLng, destLat, destLng);
  const durationMin = estimateFlightDuration(distanceKm, cruiseSpeedKmh);
  const durationHours = durationMin / 60;
  const price = roundToHundred(hourlyRate * durationHours);
  return { distanceKm: Math.round(distanceKm), durationMin, durationHours, price };
}

// Calculate total trip price for multi-leg
export function calculateTripPrice(
  legs: { originLat: number; originLng: number; destLat: number; destLng: number; originCode?: string; destCode?: string }[],
  cruiseSpeedKmh: number,
  hourlyRate: number,
  minBookingHours: number
): {
  legs: { originCode?: string; destCode?: string; distanceKm: number; durationMin: number; price: number }[];
  totalDistanceKm: number;
  totalDurationMin: number;
  totalHours: number;
  subtotal: number;
  totalPrice: number;
  platformFee: number;
  grandTotal: number;
} {
  const legResults = legs.map((leg) => {
    const result = calculateLegPrice(leg.originLat, leg.originLng, leg.destLat, leg.destLng, cruiseSpeedKmh, hourlyRate);
    return { ...result, originCode: leg.originCode, destCode: leg.destCode };
  });

  const totalDistanceKm = legResults.reduce((sum, l) => sum + l.distanceKm, 0);
  const totalDurationMin = legResults.reduce((sum, l) => sum + l.durationMin, 0);
  const totalHours = totalDurationMin / 60;
  const subtotal = legResults.reduce((sum, l) => sum + l.price, 0);
  const minTotal = roundToHundred(hourlyRate * minBookingHours);
  const totalPrice = Math.max(subtotal, minTotal);
  const platformFee = roundToHundred(totalPrice * 0.08);
  const grandTotal = totalPrice + platformFee;

  return { legs: legResults, totalDistanceKm, totalDurationMin, totalHours, subtotal, totalPrice, platformFee, grandTotal };
}
