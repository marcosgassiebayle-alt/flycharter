"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const newLocale = locale === "es" ? "en" : "es";
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLocale}
      className="font-heading font-semibold text-sm gap-1.5"
      aria-label={locale === "es" ? "Switch to English" : "Cambiar a Español"}
    >
      <Globe className="h-4 w-4" />
      {locale === "es" ? "EN" : "ES"}
    </Button>
  );
}
