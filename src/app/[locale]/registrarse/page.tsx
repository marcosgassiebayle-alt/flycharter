"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { useRouter, Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plane, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    companyName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || t("registerError"));
        setLoading(false);
        return;
      }

      // Auto-login after registration
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.ok) {
        router.push("/panel/publicar");
      }
    } catch {
      setError(t("registerError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Plane className="h-10 w-10 text-brand-primary mx-auto mb-3" />
          <h1 className="font-heading font-bold text-2xl">{t("register")}</h1>
        </div>

        <Card className="rounded-card">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 text-brand-error text-sm bg-brand-error/10 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

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
                <Label>{t("companyName")}</Label>
                <Input
                  value={form.companyName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, companyName: e.target.value }))
                  }
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
                <Label>{t("password")}</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, password: e.target.value }))
                  }
                  required
                  minLength={8}
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-primary text-white font-heading font-semibold rounded-button"
              >
                {loading ? "..." : t("registerButton")}
              </Button>
            </form>

            <div className="text-center mt-6 text-sm text-muted-foreground">
              {t("hasAccount")}{" "}
              <Link
                href="/ingresar"
                className="text-brand-primary font-semibold hover:underline"
              >
                {t("loginLink")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
