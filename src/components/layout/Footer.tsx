"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Plane, Mail, Phone } from "lucide-react";

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-secondary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Plane className="h-6 w-6 text-brand-accent" />
              <span className="font-heading font-bold text-xl">
                FlyCharter
              </span>
            </div>
            <p className="text-white/70 text-sm">{t("tagline")}</p>
          </div>

          {/* For Clients */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">
              {t("forClients")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/aviones"
                  className="text-white/70 hover:text-white text-sm transition-colors"
                >
                  {t("searchFlights")}
                </Link>
              </li>
              <li>
                <Link
                  href="/solicitar"
                  className="text-white/70 hover:text-white text-sm transition-colors"
                >
                  {t("requestFlight")}
                </Link>
              </li>
              <li>
                <Link
                  href="/como-funciona"
                  className="text-white/70 hover:text-white text-sm transition-colors"
                >
                  {t("howItWorks")}
                </Link>
              </li>
            </ul>
          </div>

          {/* For Operators */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">
              {t("forOperators")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/registrarse"
                  className="text-white/70 hover:text-white text-sm transition-colors"
                >
                  {t("registerOperator")}
                </Link>
              </li>
              <li>
                <Link
                  href="/panel/publicar"
                  className="text-white/70 hover:text-white text-sm transition-colors"
                >
                  {t("publishFlight")}
                </Link>
              </li>
              <li>
                <Link
                  href="/operadores"
                  className="text-white/70 hover:text-white text-sm transition-colors"
                >
                  {t("operatorBenefits")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">
              {t("contact")}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-white/70 text-sm">
                <Mail className="h-4 w-4" />
                info@flycharter.com.ar
              </li>
              <li className="flex items-center gap-2 text-white/70 text-sm">
                <Phone className="h-4 w-4" />
                +54 11 XXXX-XXXX
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-8 text-center">
          <p className="text-white/50 text-sm">
            {t("copyright", { year: year.toString() })}
          </p>
        </div>
      </div>
    </footer>
  );
}
