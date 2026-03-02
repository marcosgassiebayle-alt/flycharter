import { getTranslations } from "next-intl/server";
import { ListingsContent } from "@/components/offers/ListingsContent";

export async function generateMetadata() {
  const t = await getTranslations("meta");
  return {
    title: t("helicoptersTitle"),
    description: t("helicoptersDescription"),
  };
}

export default async function HelicopterosPage() {
  const t = await getTranslations("offers");

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-10">
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-brand-secondary mb-8">
        {t("helicoptersTitle")}
      </h1>
      <ListingsContent vehicleType="HELICOPTER" />
    </div>
  );
}
