"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Lock } from "lucide-react";

export default function BidCheckoutPage() {
  const params = useParams();
  const bidId = params.bidId as string;
  const t = useTranslations("checkout");
  const tPricing = useTranslations("pricing");

  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const charterPrice = 15000;
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
          bidId,
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
          passengersCount: 1,
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      // silently handled
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-8 md:py-16 px-4">
      <h1 className="font-heading font-bold text-2xl mb-8">{t("title")}</h1>

      <Card className="rounded-card">
        <CardHeader>
          <CardTitle className="font-heading">{t("customerInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{t("name")}</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
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

          <Separator />

          <div className="space-y-2">
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
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="terms"
              checked={accepted}
              onCheckedChange={(c) => setAccepted(c as boolean)}
            />
            <label htmlFor="terms" className="text-sm">
              {t("terms")}
            </label>
          </div>

          <Button
            onClick={handleCheckout}
            disabled={loading || !accepted || !form.name || !form.email}
            className="w-full bg-gradient-primary text-white font-heading font-semibold rounded-button py-6 text-lg"
          >
            {loading
              ? t("processing")
              : t("pay").replace("{amount}", total.toLocaleString())}
          </Button>

          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
            <Lock className="h-3 w-3" /> {t("secure")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
