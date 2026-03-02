"use client";

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  Plane,
  List,
  MessageSquare,
  CreditCard,
  Send,
  PlusCircle,
  Menu,
  X,
  LogIn,
} from "lucide-react";
import { useState } from "react";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const t = useTranslations("operator");
  const tAuth = useTranslations("auth");
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="bg-white rounded-card shadow-md p-8 max-w-md w-full text-center">
          <LogIn className="h-12 w-12 text-brand-secondary mx-auto mb-4" />
          <h2 className="font-heading font-bold text-xl mb-2">
            {tAuth("login")}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t("panel")}
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/ingresar">
              <Button className="bg-gradient-primary text-white font-heading font-semibold rounded-button">
                {tAuth("loginButton")}
              </Button>
            </Link>
            <Link href="/registrarse">
              <Button variant="outline" className="rounded-button">
                {tAuth("registerButton")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/panel/publicar", label: t("publish"), icon: PlusCircle },
    { href: "/panel/ofertas", label: t("myOffers"), icon: List },
    { href: "/panel/bids", label: t("myBids"), icon: Send },
    { href: "/panel/mensajes", label: t("messages"), icon: MessageSquare },
    { href: "/panel/pagos", label: t("payments"), icon: CreditCard },
  ];

  const sidebar = (
    <nav className="flex flex-col gap-1 p-4">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? "bg-white/20 text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 bg-brand-secondary shrink-0">
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-brand-accent" />
            <span className="font-heading font-bold text-white">
              {t("panel")}
            </span>
          </div>
          <p className="text-white/60 text-xs mt-1">{session.user.name}</p>
        </div>
        {sidebar}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-brand-secondary z-50">
            <div className="flex items-center justify-between p-4 border-b border-white/20">
              <span className="font-heading font-bold text-white">
                {t("panel")}
              </span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-surface-border bg-white">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-heading font-semibold">{t("panel")}</span>
        </div>
        <div className="p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}
