import { getTranslations } from "next-intl/server";
import { SearchBar } from "@/components/home/SearchBar";
import { FeaturedOffers } from "@/components/home/FeaturedOffers";
import { Search, Shield, Plane } from "lucide-react";
import { Link } from "@/i18n/routing";

export default async function HomePage() {
  const t = await getTranslations("hero");
  const tCommon = await getTranslations("common");
  const tHowItWorks = await getTranslations("howItWorks");
  const tOperators = await getTranslations("operatorsLanding");

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden -mt-16">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-secondary via-brand-secondary-light to-brand-primary" />
        {/* Overlay pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,_white_0%,_transparent_60%)]" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6 pt-24 pb-16 text-center">
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight">
            {t("title")}
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10">
            {t("subtitle")}
          </p>

          {/* SearchBar (client component) */}
          <SearchBar />
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
            preserveAspectRatio="none"
          >
            <path
              d="M0 40C240 80 480 100 720 80C960 60 1200 20 1440 40V100H0V40Z"
              fill="var(--color-surface-base)"
            />
          </svg>
        </div>
      </section>

      {/* Featured Offers Tabs */}
      <FeaturedOffers />

      {/* Request CTA Section */}
      <section className="bg-surface-alt py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4 md:px-6 text-center">
          <div className="bg-white rounded-container shadow-lg p-8 md:p-12">
            <Search className="size-12 text-brand-primary mx-auto mb-4" />
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-brand-secondary mb-3">
              {tCommon("requestCta")}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              {tCommon("requestCtaDesc")}
            </p>
            <Link
              href="/solicitar"
              className="inline-flex items-center justify-center h-11 px-8 bg-gradient-primary text-white font-semibold rounded-button hover:opacity-90 transition-opacity"
            >
              {tCommon("requestCtaButton")}
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-brand-secondary text-center mb-12">
            {tHowItWorks("title")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-brand-primary/10 mx-auto mb-5">
                <Search className="size-7 text-brand-primary" />
              </div>
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-secondary text-white text-sm font-bold mb-3">
                1
              </div>
              <h3 className="font-heading text-lg font-semibold text-brand-secondary mb-2">
                {tHowItWorks("client1Title")}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {tHowItWorks("client1Desc")}
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-brand-accent/10 mx-auto mb-5">
                <Shield className="size-7 text-brand-accent" />
              </div>
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-secondary text-white text-sm font-bold mb-3">
                2
              </div>
              <h3 className="font-heading text-lg font-semibold text-brand-secondary mb-2">
                {tHowItWorks("client2Title")}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {tHowItWorks("client2Desc")}
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-brand-success/10 mx-auto mb-5">
                <Plane className="size-7 text-brand-success" />
              </div>
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-secondary text-white text-sm font-bold mb-3">
                3
              </div>
              <h3 className="font-heading text-lg font-semibold text-brand-secondary mb-2">
                {tHowItWorks("client3Title")}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {tHowItWorks("client3Desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Operator CTA */}
      <section className="bg-brand-secondary text-white py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4 md:px-6 text-center">
          <Plane className="size-12 text-brand-accent mx-auto mb-5" />
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            {tOperators("title")}
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            {tOperators("subtitle")}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 max-w-2xl mx-auto text-left">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-accent/20 shrink-0 mt-0.5">
                <span className="text-brand-accent text-sm font-bold">1</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">{tOperators("benefit1Title")}</h4>
                <p className="text-white/70 text-sm">{tOperators("benefit1Desc")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-accent/20 shrink-0 mt-0.5">
                <span className="text-brand-accent text-sm font-bold">2</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">{tOperators("benefit2Title")}</h4>
                <p className="text-white/70 text-sm">{tOperators("benefit2Desc")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-accent/20 shrink-0 mt-0.5">
                <span className="text-brand-accent text-sm font-bold">3</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">{tOperators("benefit3Title")}</h4>
                <p className="text-white/70 text-sm">{tOperators("benefit3Desc")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-accent/20 shrink-0 mt-0.5">
                <span className="text-brand-accent text-sm font-bold">4</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">{tOperators("benefit4Title")}</h4>
                <p className="text-white/70 text-sm">{tOperators("benefit4Desc")}</p>
              </div>
            </div>
          </div>

          <Link
            href="/operadores"
            className="inline-flex items-center justify-center h-12 px-8 bg-gradient-primary text-white font-semibold rounded-button hover:opacity-90 transition-opacity text-lg"
          >
            {tOperators("registerCta")}
          </Link>
        </div>
      </section>
    </>
  );
}
