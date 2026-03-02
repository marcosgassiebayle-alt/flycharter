import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Link from "next/link";
import { Users, Shield, TrendingDown, DollarSign } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return { title: t("operatorsTitle"), description: t("operatorsDescription") };
}

export default async function OperatorsPage() {
  const t = await getTranslations("operatorsLanding");

  const benefits = [
    { icon: Users, title: t("benefit1Title"), desc: t("benefit1Desc") },
    { icon: Shield, title: t("benefit2Title"), desc: t("benefit2Desc") },
    { icon: TrendingDown, title: t("benefit3Title"), desc: t("benefit3Desc") },
    { icon: DollarSign, title: t("benefit4Title"), desc: t("benefit4Desc") },
  ];

  const faqs = [
    { q: t("faq1Q"), a: t("faq1A") },
    { q: t("faq2Q"), a: t("faq2A") },
    { q: t("faq3Q"), a: t("faq3A") },
    { q: t("faq4Q"), a: t("faq4A") },
    { q: t("faq5Q"), a: t("faq5A") },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-secondary via-brand-secondary-light to-brand-primary py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="font-heading font-bold text-4xl md:text-6xl text-white mb-4">
            {t("title")}
          </h1>
          <p className="text-xl text-white/80 mb-8">{t("subtitle")}</p>
          <Link href="/registrarse">
            <button className="bg-gradient-primary text-white font-heading font-semibold px-8 py-4 rounded-button text-lg hover:opacity-90 transition-opacity">
              {t("registerCta")}
            </button>
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <div
                key={i}
                className="bg-white rounded-card p-6 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
              >
                <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center mb-4">
                  <b.icon className="h-7 w-7 text-brand-primary" />
                </div>
                <h3 className="font-heading font-bold text-lg mb-2">
                  {b.title}
                </h3>
                <p className="text-muted-foreground text-sm">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-surface-alt">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-heading font-bold text-3xl text-center mb-10">
            FAQ
          </h2>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-white rounded-card px-6 border-0 shadow-sm"
              >
                <AccordionTrigger className="font-heading font-semibold text-left">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-brand-secondary text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-heading font-bold text-3xl mb-6">
            {t("title")}
          </h2>
          <Link href="/registrarse">
            <button className="bg-gradient-primary text-white font-heading font-semibold px-8 py-4 rounded-button text-lg hover:opacity-90 transition-opacity">
              {t("registerCta")}
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
