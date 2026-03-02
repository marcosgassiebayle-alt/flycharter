"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plane, Lock, MapPin, Calendar, Users, Minus, Plus } from "lucide-react";

export default function CheckoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const offerId = params.offerId as string;
  const t = useTranslations("checkout");
  const tPricing = useTranslations("pricing");

  const [passengers, setPassengers] = useState(
    parseInt(searchParams.get("passengers") || "1")
  );
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock offer data
  const charterPrice = 12000;
  const platformFee = Math.round(charterPrice * 0.08);
  const total = charterPrice + platformFee;

  const handleCheckout = async () => {
    if (!accepted || !form.name || !form.email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerId,
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
          passengersCount: passengers,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // error handled silently
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 md:py-16 px-4">
      <h1 className="font-heading font-bold text-2xl md:text-3xl mb-8">
        {t("title")}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Flight Summary */}
        <Card className="rounded-card">
          <CardHeader>
            <CardTitle className="font-heading">{t("flightSummary")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-brand-primary" />
              </div>
              <div>
                <p className="font-heading font-bold">
                  San Fernando → Bariloche
                </p>
                <p className="text-sm text-muted-foreground">Ida y vuelta</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-brand-primary" />
              </div>
              <div>
                <p className="font-semibold">15 Abr 2026 - 20 Abr 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                <Plane className="h-5 w-5 text-brand-primary" />
              </div>
              <div>
                <p className="font-semibold">Cessna Citation CJ3</p>
                <p className="text-sm text-muted-foreground">
                  SkyFleet Argentina
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment */}
        <div className="space-y-6">
          <Card className="rounded-card">
            <CardHeader>
              <CardTitle className="font-heading">
                {t("customerInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t("name")}</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label>{t("email")}</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label>{t("phone")}</Label>
                <Input
                  value={form.phone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, phone: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>{t("passengers")}</Label>
                <div className="flex items-center gap-3 mt-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPassengers(Math.max(1, passengers - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="font-mono font-semibold text-lg w-8 text-center">
                    {passengers}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPassengers(Math.min(9, passengers + 1))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-card">
            <CardHeader>
              <CardTitle className="font-heading">
                {t("paymentDetails")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {tPricing("charterPrice")}
                </span>
                <span className="font-mono font-semibold">
                  {formatCurrency(charterPrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {tPricing("platformFee")}
                </span>
                <span className="font-mono font-semibold">
                  {formatCurrency(platformFee)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-heading font-bold text-lg">
                  {tPricing("total")}
                </span>
                <span className="font-mono font-bold text-lg text-brand-primary">
                  {formatCurrency(total)}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <Checkbox
                  id="terms"
                  checked={accepted}
                  onCheckedChange={(checked) => setAccepted(checked as boolean)}
                />
                <label htmlFor="terms" className="text-sm">
                  {t("terms")}
                </label>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={loading || !accepted || !form.name || !form.email}
                className="w-full bg-gradient-primary text-white font-heading font-semibold rounded-button py-6 text-lg mt-4"
              >
                {loading
                  ? t("processing")
                  : `${t("pay").replace("{amount}", total.toLocaleString())}`}
              </Button>

              <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1 mt-2">
                <Lock className="h-3 w-3" /> {t("secure")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
