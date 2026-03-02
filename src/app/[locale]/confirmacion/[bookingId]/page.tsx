import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { CheckCircle, MessageSquare, Home } from "lucide-react";

export default async function ConfirmationPage() {
  const t = await getTranslations("confirmation");

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center">
        {/* Animated check */}
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-full bg-brand-success/10 flex items-center justify-center mx-auto animate-[pulse_2s_ease-in-out_1]">
            <CheckCircle className="h-14 w-14 text-brand-success" />
          </div>
        </div>

        <h1 className="font-heading font-bold text-3xl mb-4">{t("title")}</h1>
        <p className="text-muted-foreground text-lg mb-8">{t("subtitle")}</p>

        <div className="bg-white rounded-card shadow-md p-6 mb-8">
          <h3 className="font-heading font-semibold text-lg mb-4">
            {t("bookingSummary")}
          </h3>
          <div className="space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ruta</span>
              <span className="font-semibold">San Fernando → Bariloche</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha</span>
              <span className="font-semibold">15 Abr 2026</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Aeronave</span>
              <span className="font-semibold">Cessna Citation CJ3</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/panel/mensajes">
            <button className="bg-gradient-primary text-white font-heading font-semibold px-6 py-3 rounded-button hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto">
              <MessageSquare className="h-4 w-4" />
              {t("goToChat")}
            </button>
          </Link>
          <Link href="/">
            <button className="border border-surface-border text-gray-700 font-heading font-semibold px-6 py-3 rounded-button hover:bg-surface-alt transition-colors flex items-center gap-2 mx-auto">
              <Home className="h-4 w-4" />
              {t("backToHome")}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
