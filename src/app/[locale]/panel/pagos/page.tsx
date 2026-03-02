"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, ExternalLink, CheckCircle } from "lucide-react";

export default function PaymentsPage() {
  const t = useTranslations("operator");
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  const connectStripe = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/connect", { method: "POST" });
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

  if (connected) {
    return (
      <div className="max-w-lg mx-auto">
        <Card className="rounded-card">
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-16 w-16 text-brand-success mx-auto mb-4" />
            <h2 className="font-heading font-bold text-xl mb-2">
              {t("stripeConnected")}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t("stripeDescription")}
            </p>
            <Button variant="outline" className="rounded-button">
              <ExternalLink className="h-4 w-4 mr-2" />
              {t("stripeDashboard")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="font-heading font-bold text-2xl mb-6">{t("payments")}</h1>
      <Card className="rounded-card">
        <CardContent className="py-12 text-center">
          <CreditCard className="h-16 w-16 text-brand-secondary mx-auto mb-4" />
          <h2 className="font-heading font-bold text-xl mb-2">
            {t("noStripe")}
          </h2>
          <p className="text-muted-foreground mb-6">{t("noStripeDesc")}</p>
          <Button
            onClick={connectStripe}
            disabled={loading}
            className="bg-gradient-primary text-white font-heading font-semibold rounded-button"
          >
            {loading ? "..." : t("connectStripe")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
