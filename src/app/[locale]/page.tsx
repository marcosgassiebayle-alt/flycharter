import { getTranslations } from "next-intl/server";
import { SearchBar } from "@/components/home/SearchBar";
import { FeaturedOffers } from "@/components/home/FeaturedOffers";
import { SpecialOffersSection } from "@/components/home/SpecialOffersSection";
import { Search, Shield, Plane, Star, Zap, Clock } from "lucide-react";
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
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D2F45] via-[#1B4965] to-[#2D6A8F]" />
        {/* Mesh overlay */}
        <div className="absolute inset-0 opacity-20" style={{backgroundImage: "radial-gradient(circle at 20% 60%, #E85D26 0%, transparent 50%), radial-gradient(circle at 80% 30%, #F4A261 0%, transparent 50%)"}} />
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-5" style={{backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)", backgroundSize: "60px 60px"}} />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6 pt-28 pb-24 text-center">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white/90 text-sm font-medium mb-8">
            <Star className="size-3.5 fill-brand-accent text-brand-accent" />
            Vuelos privados en toda Argentina
          </div>

          <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-5 tracking-tight leading-none">
            {t("title")}
          </h1>
          <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto mb-12 font-light">
            {t("subtitle")}
          </p>

          {/* SearchBar */}
          <SearchBar />

          {/* Quick stats */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-12 text-white/60 text-sm">
            <div className="flex items-center gap-2">
              <Plane className="size-4 text-brand-accent" />
              <span>Aviones & helicópteros</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="size-4 text-brand-success" />
              <span>Operadores verificados</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-brand-accent" />
              <span>Empty legs con descuento</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-brand-success" />
              <span>Pago seguro con Stripe</span>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0 30C360 70 720 80 1080 60C1260 50 1380 30 1440 30V80H0V30Z" fill="#FAFAF8" />
          </svg>
        </div>
      </section>

      {/* Featured Offers */}
      <FeaturedOffers />

      {/* Special Offers Section */}
      <SpecialOffersSection />

      {/* Request CTA */}
      <section className="bg-surface-alt py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4 md:px-6 text-center">
          <div className="bg-white rounded-[24px] shadow-[0_4px_24px_rgba(27,73,101,0.1)] p-8 md:p-12 border border-surface-border">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-brand-primary/10 mx-auto mb-5">
              <Search className="size-8 text-brand-primary" />
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-brand-secondary mb-3">
              {tCommon("requestCta")}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto text-lg">
              {tCommon("requestCtaDesc")}
            </p>
            <Link
              href="/solicitar"
              className="inline-flex items-center justify-center h-12 px-10 bg-gradient-to-r from-brand-primary to-brand-accent text-white font-heading font-semibold rounded-button hover:opacity-90 transition-opacity text-base shadow-[0_4px_14px_rgba(232,93,38,0.4)]"
            >
              {tCommon("requestCtaButton")}
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-surface-base">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-14">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-brand-secondary mb-3">
              {tHowItWorks("title")}
            </h2>
            <p className="text-muted-foreground text-lg">
              {tHowItWorks("forClients")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {[
              { icon: Search, step: 1, title: tHowItWorks("client1Title"), desc: tHowItWorks("client1Desc"), color: "bg-brand-primary/10", iconColor: "text-brand-primary" },
              { icon: Shield, step: 2, title: tHowItWorks("client2Title"), desc: tHowItWorks("client2Desc"), color: "bg-brand-accent/10", iconColor: "text-brand-accent" },
              { icon: Plane, step: 3, title: tHowItWorks("client3Title"), desc: tHowItWorks("client3Desc"), color: "bg-brand-success/10", iconColor: "text-brand-success" },
            ].map(({ icon: Icon, step, title, desc, color, iconColor }) => (
              <div key={step} className="relative text-center group">
                {/* Step number */}
                <div className="inline-flex items-center justify-center mb-5">
                  <div className={`relative flex items-center justify-center w-20 h-20 rounded-2xl ${color} transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className={`size-8 ${iconColor}`} />
                    <span className="absolute -top-2 -right-2 flex items-center justify-center w-7 h-7 rounded-full bg-brand-secondary text-white text-xs font-bold font-heading">
                      {step}
                    </span>
                  </div>
                </div>
                <h3 className="font-heading text-xl font-bold text-brand-secondary mb-2">
                  {title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Operator CTA */}
      <section className="bg-brand-secondary text-white py-16 md:py-24 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(circle at 80% 50%, #E85D26 0%, transparent 60%)"}} />
        <div className="relative mx-auto max-w-5xl px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-white/80 text-sm font-medium mb-6">
                <Plane className="size-3.5 text-brand-accent" />
                Para operadores aéreos
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 leading-tight">
                {tOperators("title")}
              </h2>
              <p className="text-white/70 text-lg mb-8">
                {tOperators("subtitle")}
              </p>
              <Link
                href="/operadores"
                className="inline-flex items-center justify-center h-12 px-8 bg-gradient-to-r from-brand-primary to-brand-accent text-white font-heading font-semibold rounded-button hover:opacity-90 transition-opacity text-base shadow-[0_4px_14px_rgba(232,93,38,0.4)]"
              >
                {tOperators("registerCta")}
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: tOperators("benefit1Title"), desc: tOperators("benefit1Desc"), num: "01" },
                { title: tOperators("benefit2Title"), desc: tOperators("benefit2Desc"), num: "02" },
                { title: tOperators("benefit3Title"), desc: tOperators("benefit3Desc"), num: "03" },
                { title: tOperators("benefit4Title"), desc: tOperators("benefit4Desc"), num: "04" },
              ].map(({ title, desc, num }) => (
                <div key={num} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <p className="text-brand-accent text-xs font-bold font-mono mb-2">{num}</p>
                  <h4 className="font-heading font-bold text-sm mb-1">{title}</h4>
                  <p className="text-white/60 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
