import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://flycharter.com.ar";

  const staticPages = [
    "",
    "/aviones",
    "/helicopteros",
    "/solicitudes",
    "/solicitar",
    "/como-funciona",
    "/operadores",
    "/contacto",
    "/ingresar",
    "/registrarse",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${baseUrl}/es${page}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: page === "" ? 1 : 0.8,
  }));

  // In production, fetch active offers from DB
  // const offers = await prisma.offer.findMany({ where: { status: "ACTIVE" }, select: { slug: true, updatedAt: true } });
  // const offerEntries = offers.map(offer => ({ url: `${baseUrl}/es/oferta/${offer.slug}`, lastModified: offer.updatedAt, priority: 0.9 }));

  return [...staticEntries];
}
