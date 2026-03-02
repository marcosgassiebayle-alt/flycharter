import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { RequestsListContent } from "@/components/requests/RequestsListContent";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return {
    title: t("requestsTitle"),
    description: t("requestsDescription"),
  };
}

export default async function SolicitudesPage() {
  const t = await getTranslations("requests");

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-brand-secondary mb-2">
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("subtitle")}
          </p>
        </div>
        <Button
          asChild
          className="bg-gradient-primary text-white rounded-button font-semibold hover:opacity-90 transition-opacity h-11 px-6 shrink-0"
        >
          <Link href="/solicitar">
            <Send className="size-4 mr-2" />
            {t("create")}
          </Link>
        </Button>
      </div>

      {/* Content (client component) */}
      <RequestsListContent />
    </div>
  );
}
