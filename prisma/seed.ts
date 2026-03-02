import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clear existing data for idempotent re-runs
  await prisma.chatMessage.deleteMany();
  await prisma.chatRoom.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.flightRequest.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.aircraft.deleteMany();
  await prisma.operator.deleteMany();
  console.log("Cleared existing data");

  const passwordHash = await bcrypt.hash("Test1234!", 12);

  // Operators
  const carlos = await prisma.operator.upsert({
    where: { email: "carlos@skyfleet.com.ar" },
    update: {},
    create: {
      email: "carlos@skyfleet.com.ar",
      passwordHash,
      name: "Carlos Menéndez",
      companyName: "SkyFleet Argentina",
      phone: "+54 11 4555-0001",
      description:
        "Operador con más de 15 años de experiencia en aviación ejecutiva. Flota moderna y pilotos certificados.",
      verified: true,
    },
  });

  const maria = await prisma.operator.upsert({
    where: { email: "maria@helitours.com.ar" },
    update: {},
    create: {
      email: "maria@helitours.com.ar",
      passwordHash,
      name: "María Rodríguez",
      companyName: "Helitours Patagonia",
      phone: "+54 11 4555-0002",
      description:
        "Especialistas en tours en helicóptero por la Patagonia y Buenos Aires. Experiencias únicas e inolvidables.",
      verified: true,
    },
  });

  const jorge = await prisma.operator.upsert({
    where: { email: "jorge@australjets.com.ar" },
    update: {},
    create: {
      email: "jorge@australjets.com.ar",
      passwordHash,
      name: "Jorge Alvarez",
      companyName: "Austral Jets",
      phone: "+54 11 4555-0003",
      description:
        "Vuelos ejecutivos de larga distancia con los más altos estándares de seguridad y confort.",
      verified: false,
    },
  });

  console.log("Operators created");

  // Aircraft
  const cessnaCJ3 = await prisma.aircraft.create({
    data: {
      operatorId: carlos.id,
      type: "PLANE",
      model: "Cessna Citation CJ3",
      capacity: 7,
      yearBuilt: 2018,
      registration: "LV-ABC",
      description:
        "Jet ejecutivo ligero ideal para vuelos nacionales. Cabina presurizada, aire acondicionado y asientos de cuero.",
      images: [
        "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800",
        "https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=800",
      ],
      amenities: ["WiFi", "Aire acondicionado", "Catering", "Asientos reclinables"],
    },
  });

  const kingAir = await prisma.aircraft.create({
    data: {
      operatorId: carlos.id,
      type: "PLANE",
      model: "Beechcraft King Air 350",
      capacity: 9,
      yearBuilt: 2020,
      registration: "LV-DEF",
      description:
        "Turbo hélice de alta performance. Ideal para rutas medias con gran capacidad de carga.",
      images: [
        "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800",
        "https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=800",
      ],
      amenities: ["WiFi", "Aire acondicionado", "Baño", "Catering"],
    },
  });

  const bell407 = await prisma.aircraft.create({
    data: {
      operatorId: maria.id,
      type: "HELICOPTER",
      model: "Bell 407GXi",
      capacity: 6,
      yearBuilt: 2021,
      registration: "LV-GHI",
      description:
        "Helicóptero monomotor de última generación. Vista panorámica 180° y operación ultra silenciosa.",
      images: [
        "https://images.unsplash.com/photo-1534786676856-f47b7013d0e4?w=800",
        "https://images.unsplash.com/photo-1605548109944-9040d0972bf5?w=800",
      ],
      amenities: ["Aire acondicionado", "USB", "Asientos reclinables"],
    },
  });

  const airbusH130 = await prisma.aircraft.create({
    data: {
      operatorId: maria.id,
      type: "HELICOPTER",
      model: "Airbus H130",
      capacity: 7,
      yearBuilt: 2019,
      registration: "LV-JKL",
      description:
        "Helicóptero bimotor con cabina amplia y silenciosa. Perfecto para tours panorámicos y traslados VIP.",
      images: [
        "https://images.unsplash.com/photo-1608236465209-5e0dbf4ac0e7?w=800",
      ],
      amenities: ["Aire acondicionado", "USB", "TV"],
    },
  });

  const learjet = await prisma.aircraft.create({
    data: {
      operatorId: jorge.id,
      type: "PLANE",
      model: "Learjet 45",
      capacity: 8,
      yearBuilt: 2015,
      registration: "LV-MNO",
      description:
        "Jet de media distancia con excelente velocidad y alcance. Cabina stand-up y servicio premium.",
      images: [
        "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800",
      ],
      amenities: [
        "WiFi",
        "Aire acondicionado",
        "Bar",
        "Catering",
        "Baño",
        "Asientos reclinables",
      ],
    },
  });

  console.log("Aircraft created");

  // Offers
  const offers = [
    {
      operatorId: carlos.id,
      aircraftId: cessnaCJ3.id,
      category: "ROUND_TRIP" as const,
      vehicleType: "PLANE" as const,
      origin: "Aeropuerto de San Fernando",
      originCode: "SFN",
      originLat: -34.453,
      originLng: -58.59,
      destination: "Aeropuerto de Bariloche",
      destinationCode: "BRC",
      destinationLat: -41.151,
      destinationLng: -71.158,
      departureAt: new Date("2026-04-15T10:00:00Z"),
      returnAt: new Date("2026-04-20T16:00:00Z"),
      basePrice: 18500,
      minPrice: 18500,
      isEmptyLeg: false,
      slug: "sfn-brc-2026-04-15-a1b2",
      featured: true,
    },
    {
      operatorId: maria.id,
      aircraftId: bell407.id,
      category: "TOUR" as const,
      vehicleType: "HELICOPTER" as const,
      origin: "Helipuerto Buenos Aires",
      originCode: "HBA",
      originLat: -34.592,
      originLng: -58.37,
      departureAt: new Date("2026-03-20T14:00:00Z"),
      basePrice: 2800,
      minPrice: 2800,
      isEmptyLeg: false,
      slug: "hba-tour-2026-03-20-c3d4",
      featured: true,
    },
    {
      operatorId: carlos.id,
      aircraftId: kingAir.id,
      category: "ONE_WAY" as const,
      vehicleType: "PLANE" as const,
      origin: "Aeropuerto de San Fernando",
      originCode: "SFN",
      originLat: -34.453,
      originLng: -58.59,
      destination: "Aeropuerto de Mendoza",
      destinationCode: "MDZ",
      destinationLat: -32.832,
      destinationLng: -68.793,
      departureAt: new Date("2026-03-25T08:00:00Z"),
      basePrice: 9200,
      minPrice: 9200,
      isEmptyLeg: false,
      slug: "sfn-mdz-2026-03-25-e5f6",
      featured: false,
    },
    {
      operatorId: maria.id,
      aircraftId: airbusH130.id,
      category: "TOUR" as const,
      vehicleType: "HELICOPTER" as const,
      origin: "Aeropuerto de El Calafate",
      originCode: "FTE",
      originLat: -50.281,
      originLng: -72.053,
      departureAt: new Date("2026-04-10T11:00:00Z"),
      basePrice: 4500,
      minPrice: 4500,
      isEmptyLeg: false,
      slug: "fte-tour-2026-04-10-g7h8",
      featured: true,
    },
    {
      operatorId: jorge.id,
      aircraftId: learjet.id,
      category: "ROUND_TRIP" as const,
      vehicleType: "PLANE" as const,
      origin: "Aeropuerto de San Fernando",
      originCode: "SFN",
      originLat: -34.453,
      originLng: -58.59,
      destination: "Aeropuerto de Iguazú",
      destinationCode: "IGR",
      destinationLat: -25.737,
      destinationLng: -54.474,
      departureAt: new Date("2026-04-05T07:00:00Z"),
      returnAt: new Date("2026-04-08T18:00:00Z"),
      basePrice: 22000,
      minPrice: 22000,
      isEmptyLeg: false,
      slug: "sfn-igr-2026-04-05-i9j0",
      featured: false,
    },
    {
      operatorId: carlos.id,
      aircraftId: cessnaCJ3.id,
      category: "ONE_WAY" as const,
      vehicleType: "PLANE" as const,
      origin: "Aeropuerto de Córdoba",
      originCode: "COR",
      originLat: -31.324,
      originLng: -64.208,
      destination: "Aeropuerto de San Fernando",
      destinationCode: "SFN",
      destinationLat: -34.453,
      destinationLng: -58.59,
      departureAt: new Date("2026-03-28T15:00:00Z"),
      basePrice: 7800,
      minPrice: 7800,
      isEmptyLeg: false,
      slug: "cor-sfn-2026-03-28-k1l2",
      featured: false,
    },
    {
      operatorId: maria.id,
      aircraftId: bell407.id,
      category: "TOUR" as const,
      vehicleType: "HELICOPTER" as const,
      origin: "Aeropuerto de Iguazú",
      originCode: "IGR",
      originLat: -25.737,
      originLng: -54.474,
      departureAt: new Date("2026-04-12T10:00:00Z"),
      basePrice: 3500,
      minPrice: 3500,
      isEmptyLeg: false,
      slug: "igr-tour-2026-04-12-m3n4",
      featured: false,
    },
    // Empty Legs
    {
      operatorId: carlos.id,
      aircraftId: cessnaCJ3.id,
      category: "RETURN" as const,
      vehicleType: "PLANE" as const,
      origin: "Aeropuerto de Bariloche",
      originCode: "BRC",
      originLat: -41.151,
      originLng: -71.158,
      destination: "Aeropuerto de San Fernando",
      destinationCode: "SFN",
      destinationLat: -34.453,
      destinationLng: -58.59,
      departureAt: new Date("2026-04-20T10:00:00Z"),
      basePrice: 12000,
      minPrice: 5500,
      isEmptyLeg: true,
      discountType: "TIERED",
      discountRules: [
        { daysBeforeDeparture: 14, discountPercent: 15 },
        { daysBeforeDeparture: 7, discountPercent: 30 },
        { daysBeforeDeparture: 3, discountPercent: 45 },
        { daysBeforeDeparture: 1, discountPercent: 55 },
      ],
      slug: "brc-sfn-emptyleg-2026-04-20-o5p6",
      featured: false,
    },
    {
      operatorId: carlos.id,
      aircraftId: kingAir.id,
      category: "RETURN" as const,
      vehicleType: "PLANE" as const,
      origin: "Aeropuerto de Mendoza",
      originCode: "MDZ",
      originLat: -32.832,
      originLng: -68.793,
      destination: "Aeropuerto de San Fernando",
      destinationCode: "SFN",
      destinationLat: -34.453,
      destinationLng: -58.59,
      departureAt: new Date("2026-03-26T12:00:00Z"),
      basePrice: 9000,
      minPrice: 4000,
      isEmptyLeg: true,
      discountType: "LINEAR",
      discountRules: { maxDiscountPercent: 55, startDaysBefore: 14 },
      slug: "mdz-sfn-emptyleg-2026-03-26-q7r8",
      featured: false,
    },
    {
      operatorId: jorge.id,
      aircraftId: learjet.id,
      category: "RETURN" as const,
      vehicleType: "PLANE" as const,
      origin: "Aeropuerto de Ushuaia",
      originCode: "USH",
      originLat: -54.843,
      originLng: -68.296,
      destination: "Aeropuerto de San Fernando",
      destinationCode: "SFN",
      destinationLat: -34.453,
      destinationLng: -58.59,
      departureAt: new Date("2026-04-02T09:00:00Z"),
      basePrice: 25000,
      minPrice: 10000,
      isEmptyLeg: true,
      discountType: "EXPONENTIAL",
      discountRules: {
        maxDiscountPercent: 60,
        startDaysBefore: 14,
        curve: 2,
      },
      slug: "ush-sfn-emptyleg-2026-04-02-s9t0",
      featured: false,
    },
  ];

  for (const offer of offers) {
    await prisma.offer.create({ data: offer });
  }

  console.log("Offers created");

  // Multi-leg offers
  const patagoniaCircuit = await prisma.offer.create({
    data: {
      operatorId: carlos.id,
      aircraftId: kingAir.id,
      category: "ONE_WAY",
      vehicleType: "PLANE",
      origin: "Aeropuerto de San Fernando",
      originCode: "SFN",
      originLat: -34.453,
      originLng: -58.59,
      destination: "Aeropuerto Internacional Malvinas Argentinas",
      destinationCode: "USH",
      destinationLat: -54.843,
      destinationLng: -68.296,
      departureAt: new Date("2026-05-10T08:00:00Z"),
      basePrice: 45000,
      minPrice: 45000,
      isEmptyLeg: false,
      slug: "sfn-brc-fte-ush-2026-05-10-multi",
      featured: true,
    },
  });

  await prisma.flightLeg.createMany({
    data: [
      { offerId: patagoniaCircuit.id, legOrder: 1, origin: "Aeropuerto de San Fernando", originCode: "SFN", destination: "Aeropuerto de Bariloche", destinationCode: "BRC", departureAt: new Date("2026-05-10T08:00:00Z") },
      { offerId: patagoniaCircuit.id, legOrder: 2, origin: "Aeropuerto de Bariloche", originCode: "BRC", destination: "Aeropuerto de El Calafate", destinationCode: "FTE", departureAt: new Date("2026-05-12T09:00:00Z") },
      { offerId: patagoniaCircuit.id, legOrder: 3, origin: "Aeropuerto de El Calafate", originCode: "FTE", destination: "Aeropuerto Internacional Malvinas Argentinas", destinationCode: "USH", departureAt: new Date("2026-05-14T10:00:00Z") },
    ],
  });

  const norteTour = await prisma.offer.create({
    data: {
      operatorId: jorge.id,
      aircraftId: learjet.id,
      category: "ROUND_TRIP",
      vehicleType: "PLANE",
      origin: "Aeropuerto de San Fernando",
      originCode: "SFN",
      originLat: -34.453,
      originLng: -58.59,
      destination: "Aeropuerto de San Fernando",
      destinationCode: "SFN",
      destinationLat: -34.453,
      destinationLng: -58.59,
      departureAt: new Date("2026-05-20T07:00:00Z"),
      returnAt: new Date("2026-05-25T18:00:00Z"),
      basePrice: 38000,
      minPrice: 38000,
      isEmptyLeg: false,
      slug: "sfn-igr-sla-sfn-2026-05-20-multi",
      featured: false,
    },
  });

  await prisma.flightLeg.createMany({
    data: [
      { offerId: norteTour.id, legOrder: 1, origin: "Aeropuerto de San Fernando", originCode: "SFN", destination: "Aeropuerto de Iguazú", destinationCode: "IGR", departureAt: new Date("2026-05-20T07:00:00Z") },
      { offerId: norteTour.id, legOrder: 2, origin: "Aeropuerto de Iguazú", originCode: "IGR", destination: "Aeropuerto de Salta", destinationCode: "SLA", departureAt: new Date("2026-05-22T10:00:00Z") },
      { offerId: norteTour.id, legOrder: 3, origin: "Aeropuerto de Salta", originCode: "SLA", destination: "Aeropuerto de San Fernando", destinationCode: "SFN", departureAt: new Date("2026-05-25T15:00:00Z") },
    ],
  });

  console.log("Multi-leg offers created");

  // Flight Requests
  await prisma.flightRequest.createMany({
    data: [
      {
        customerEmail: "lucas@email.com",
        customerName: "Lucas Fernández",
        customerPhone: "+54 11 5555-1001",
        vehicleType: "PLANE",
        category: "ROUND_TRIP",
        origin: "Aeroparque Jorge Newbery",
        originCode: "AEP",
        destination: "Aeropuerto de Bariloche",
        destinationCode: "BRC",
        departureDate: new Date("2026-04-01T00:00:00Z"),
        returnDate: new Date("2026-04-05T00:00:00Z"),
        passengersCount: 4,
        budgetMin: 10000,
        budgetMax: 18000,
        notes: "Viaje familiar. Necesitamos espacio para equipaje de ski.",
        expiresAt: new Date("2026-04-08T00:00:00Z"),
      },
      {
        customerEmail: "sofia@email.com",
        customerName: "Sofía Martínez",
        customerPhone: "+54 11 5555-1002",
        vehicleType: "HELICOPTER",
        category: "TOUR",
        origin: "Helipuerto Buenos Aires",
        originCode: "HBA",
        departureDate: new Date("2026-03-22T00:00:00Z"),
        passengersCount: 2,
        budgetMin: 1500,
        budgetMax: 3000,
        notes: "Tour panorámico por Buenos Aires para aniversario.",
        expiresAt: new Date("2026-03-29T00:00:00Z"),
      },
      {
        customerEmail: "martin@email.com",
        customerName: "Martín Gutiérrez",
        customerPhone: "+54 11 5555-1003",
        vehicleType: "PLANE",
        category: "ONE_WAY",
        origin: "Aeropuerto de San Fernando",
        originCode: "SFN",
        destination: "Aeropuerto de Neuquén",
        destinationCode: "NQN",
        departureDate: new Date("2026-03-30T00:00:00Z"),
        passengersCount: 6,
        budgetMin: 8000,
        budgetMax: 14000,
        notes:
          "Viaje de negocios. Necesitamos llegar antes de las 14hs.",
        expiresAt: new Date("2026-04-06T00:00:00Z"),
      },
    ],
  });

  console.log("Flight requests created");

  // Multi-leg request
  const multiLegReq = await prisma.flightRequest.create({
    data: {
      customerEmail: "ana@email.com",
      customerName: "Ana López",
      customerPhone: "+54 11 5555-2001",
      vehicleType: "PLANE",
      category: "ONE_WAY",
      origin: "Aeroparque Jorge Newbery",
      originCode: "AEP",
      destination: "Aeropuerto de Bariloche",
      destinationCode: "BRC",
      departureDate: new Date("2026-05-15T00:00:00Z"),
      passengersCount: 4,
      budgetMin: 25000,
      budgetMax: 40000,
      notes: "Circuito de 4 tramos. Flexibles con fechas.",
      expiresAt: new Date("2026-05-22T00:00:00Z"),
    },
  });

  await prisma.flightLeg.createMany({
    data: [
      { requestId: multiLegReq.id, legOrder: 1, origin: "Aeroparque Jorge Newbery", originCode: "AEP", destination: "Aeropuerto de Mendoza", destinationCode: "MDZ", departureAt: new Date("2026-05-15T08:00:00Z") },
      { requestId: multiLegReq.id, legOrder: 2, origin: "Aeropuerto de Mendoza", originCode: "MDZ", destination: "Aeropuerto de Bariloche", destinationCode: "BRC", departureAt: new Date("2026-05-17T10:00:00Z") },
      { requestId: multiLegReq.id, legOrder: 3, origin: "Aeropuerto de Bariloche", originCode: "BRC", destination: "Aeroparque Jorge Newbery", destinationCode: "AEP", departureAt: new Date("2026-05-20T15:00:00Z") },
    ],
  });

  console.log("Multi-leg request created");
  console.log("Seed complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
