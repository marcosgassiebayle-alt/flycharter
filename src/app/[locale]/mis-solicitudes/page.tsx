"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RequestCard,
  type FlightRequestPreview,
} from "@/components/requests/RequestCard";
import {
  Search,
  FileText,
  PlusCircle,
  Mail,
  ArrowRight,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function RequestSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-card border border-surface-border p-5 space-y-4"
        >
          <div className="flex justify-between">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-4 w-1/2" />
          <div className="border-t border-surface-border pt-3">
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyResults({ onReset }: { onReset: () => void }) {
  const t = useTranslations("myRequests");

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-surface-alt mb-5">
        <FileText className="size-7 text-muted-foreground/50" />
      </div>
      <h3 className="font-heading text-lg font-semibold text-brand-secondary mb-2">
        {t("noResults")}
      </h3>
      <p className="text-muted-foreground text-sm max-w-md mb-6">
        {t("noResultsDesc")}
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Button
          asChild
          className="bg-gradient-primary text-white rounded-button font-semibold hover:opacity-90 transition-opacity"
        >
          <Link href="/solicitar">
            <PlusCircle className="size-4 mr-2" />
            {t("createRequest")}
          </Link>
        </Button>
        <Button
          variant="outline"
          onClick={onReset}
          className="rounded-button font-medium"
        >
          {t("tryAnother")}
        </Button>
      </div>
    </div>
  );
}

function RequestResults({ email, onReset }: { email: string; onReset: () => void }) {
  const t = useTranslations("myRequests");

  const { data, isLoading } = useSWR<{ requests: FlightRequestPreview[] }>(
    `/api/requests?email=${encodeURIComponent(email)}`,
    fetcher
  );

  const requests = data?.requests ?? [];

  if (isLoading) {
    return <RequestSkeletonGrid />;
  }

  if (requests.length === 0) {
    return <EmptyResults onReset={onReset} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-xl font-bold text-brand-secondary">
          {t("resultsTitle")}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-muted-foreground hover:text-foreground"
        >
          {t("tryAnother")}
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.map((request) => (
          <RequestCard key={request.id} request={request} />
        ))}
      </div>
    </div>
  );
}

export default function MisSolicitudesPage() {
  const t = useTranslations("myRequests");

  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmittedEmail(email.trim());
    setIsSearching(true);
  }

  function handleReset() {
    setEmail("");
    setSubmittedEmail("");
    setIsSearching(false);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-6 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-secondary/10 mb-4">
          <Search className="size-7 text-brand-secondary" />
        </div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-brand-secondary mb-2">
          {t("pageTitle")}
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          {t("pageSubtitle")}
        </p>
      </div>

      {/* Email search form */}
      {!isSearching && (
        <div className="max-w-md mx-auto mb-12">
          <Card className="rounded-card border-surface-border shadow-sm">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t("emailLabel")}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("emailPlaceholder")}
                      className="pl-10 rounded-button h-11"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={!email.trim()}
                  className="w-full h-11 bg-gradient-primary text-white rounded-button font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Search className="size-4 mr-2" />
                  {t("search")}
                  <ArrowRight className="size-4 ml-1" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results */}
      {isSearching && (
        <RequestResults email={submittedEmail} onReset={handleReset} />
      )}
    </div>
  );
}
