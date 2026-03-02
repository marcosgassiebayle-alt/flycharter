"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, Clock, CheckCircle, Send } from "lucide-react";

export default function ContactPage() {
  const t = useTranslations("contact");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSent(true);
    } catch {
      // error handled silently
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="max-w-lg mx-auto py-16 px-4 text-center">
        <CheckCircle className="h-16 w-16 text-brand-success mx-auto mb-4" />
        <h2 className="font-heading font-bold text-2xl mb-2">{t("sent")}</h2>
        <p className="text-muted-foreground">{t("sentDesc")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-16 md:py-24 px-4">
      <h1 className="font-heading font-bold text-3xl md:text-4xl text-center mb-4">
        {t("title")}
      </h1>
      <p className="text-muted-foreground text-center mb-12">{t("subtitle")}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Form */}
        <Card className="rounded-card">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label>{t("name")}</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
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
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label>{t("subject")}</Label>
                <Select
                  value={form.subject}
                  onValueChange={(v) =>
                    setForm((prev) => ({ ...prev, subject: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("subject")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cliente">
                      {t("subjectClient")}
                    </SelectItem>
                    <SelectItem value="Operador">
                      {t("subjectOperator")}
                    </SelectItem>
                    <SelectItem value="Prensa">
                      {t("subjectPress")}
                    </SelectItem>
                    <SelectItem value="Otro">{t("subjectOther")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("message")}</Label>
                <Textarea
                  value={form.message}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, message: e.target.value }))
                  }
                  placeholder={t("messagePlaceholder")}
                  rows={5}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-primary text-white font-heading font-semibold rounded-button"
              >
                <Send className="h-4 w-4 mr-2" />
                {loading ? t("sending") : t("send")}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <div className="space-y-6">
          <h2 className="font-heading font-bold text-xl">
            {t("directContact")}
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-brand-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("emailLabel")}
                </p>
                <p className="font-semibold">info@flycharter.com.ar</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                <Phone className="h-5 w-5 text-brand-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("whatsapp")}
                </p>
                <p className="font-semibold">+54 11 XXXX-XXXX</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-brand-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("officeHours")}
                </p>
                <p className="font-semibold">{t("officeHoursValue")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
