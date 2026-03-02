import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Search, Shield, Plane, UserPlus, CreditCard, MessageSquare, CheckCircle } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return { title: t("howItWorksTitle"), description: t("howItWorksDescription") };
}

export default async function HowItWorksPage() {
  const t = await getTranslations("howItWorks");

  const clientSteps = [
    { icon: Search, title: t("client1Title"), desc: t("client1Desc") },
    { icon: Shield, title: t("client2Title"), desc: t("client2Desc") },
    { icon: CreditCard, title: t("client3Title"), desc: t("client3Desc") },
    { icon: MessageSquare, title: t("client4Title"), desc: t("client4Desc") },
    { icon: Plane, title: t("client5Title"), desc: t("client5Desc") },
  ];

  const operatorSteps = [
    { icon: UserPlus, title: t("operator1Title"), desc: t("operator1Desc") },
    { icon: Plane, title: t("operator2Title"), desc: t("operator2Desc") },
    { icon: CreditCard, title: t("operator3Title"), desc: t("operator3Desc") },
    { icon: CheckCircle, title: t("operator4Title"), desc: t("operator4Desc") },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-secondary via-brand-secondary-light to-brand-primary py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-white mb-4">
            {t("title")}
          </h1>
        </div>
      </section>

      {/* For Clients */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="font-heading font-bold text-3xl text-center mb-12">
            {t("forClients")}
          </h2>
          <div className="space-y-12">
            {clientSteps.map((step, i) => (
              <div
                key={i}
                className={`flex flex-col md:flex-row items-center gap-8 ${
                  i % 2 !== 0 ? "md:flex-row-reverse" : ""
                }`}
              >
                <div className="w-20 h-20 rounded-2xl bg-brand-primary/10 flex items-center justify-center shrink-0">
                  <step.icon className="h-10 w-10 text-brand-primary" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                    <span className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </span>
                    <h3 className="font-heading font-bold text-xl">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-lg">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Operators */}
      <section className="py-16 md:py-24 bg-surface-alt">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="font-heading font-bold text-3xl text-center mb-12">
            {t("forOperators")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {operatorSteps.map((step, i) => (
              <div
                key={i}
                className="bg-white rounded-card p-6 shadow-md"
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="w-10 h-10 rounded-full bg-brand-secondary text-white flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </span>
                  <step.icon className="h-6 w-6 text-brand-secondary" />
                </div>
                <h3 className="font-heading font-bold text-lg mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
