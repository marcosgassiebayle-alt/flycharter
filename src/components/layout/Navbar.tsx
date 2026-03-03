"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { Link } from "@/i18n/routing";
import { Plane, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageToggle } from "./LanguageToggle";

export function Navbar() {
  const t = useTranslations("nav");
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/aviones", label: t("planes") },
    { href: "/helicopteros", label: t("helicopters") },
    { href: "/ofertas", label: t("offers"), highlight: true },
    { href: "/solicitudes", label: t("requests") },
    { href: "/como-funciona", label: t("howItWorks") },
    { href: "/contacto", label: t("contact") },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Plane className="h-6 w-6 text-brand-primary" />
            <span className="font-heading font-bold text-xl text-brand-secondary">
              FlyCharter
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  link.highlight
                    ? "text-brand-primary font-semibold hover:text-brand-primary/80"
                    : "text-gray-700 hover:text-brand-primary"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="hidden lg:flex items-center gap-3">
            <LanguageToggle />

            {session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    {session.user.name}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/panel/ofertas">{t("myOffers")}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/panel/mensajes">{t("messages")}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/panel/pagos">{t("payments")}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    {t("logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/ingresar">
                <Button variant="ghost" size="sm">
                  {t("login")}
                </Button>
              </Link>
            )}

            <Link href="/panel/publicar">
              <Button className="bg-gradient-primary text-white font-heading font-semibold rounded-button hover:opacity-90 transition-opacity">
                {t("publishFlight")}
              </Button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="lg:hidden flex items-center gap-2">
            <LanguageToggle />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col gap-4 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="text-lg font-medium text-gray-700 hover:text-brand-primary transition-colors py-2"
                    >
                      {link.label}
                    </Link>
                  ))}

                  <div className="border-t border-surface-border pt-4 mt-4">
                    {session?.user ? (
                      <>
                        <Link
                          href="/panel/ofertas"
                          onClick={() => setOpen(false)}
                          className="block py-2 text-gray-700"
                        >
                          {t("myOffers")}
                        </Link>
                        <Link
                          href="/panel/mensajes"
                          onClick={() => setOpen(false)}
                          className="block py-2 text-gray-700"
                        >
                          {t("messages")}
                        </Link>
                        <Link
                          href="/panel/pagos"
                          onClick={() => setOpen(false)}
                          className="block py-2 text-gray-700"
                        >
                          {t("payments")}
                        </Link>
                        <button
                          onClick={() => {
                            signOut();
                            setOpen(false);
                          }}
                          className="block py-2 text-brand-error"
                        >
                          {t("logout")}
                        </button>
                      </>
                    ) : (
                      <Link
                        href="/ingresar"
                        onClick={() => setOpen(false)}
                        className="block py-2 text-gray-700"
                      >
                        {t("login")}
                      </Link>
                    )}
                  </div>

                  <Link href="/panel/publicar" onClick={() => setOpen(false)}>
                    <Button className="w-full bg-gradient-primary text-white font-heading font-semibold rounded-button mt-4">
                      {t("publishFlight")}
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
