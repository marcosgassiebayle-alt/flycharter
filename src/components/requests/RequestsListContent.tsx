"use client";

import { useTranslations } from "next-intl";
import useSWR from "swr";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RequestCard, type FlightRequestPreview } from "./RequestCard";
import { FileText, PlusCircle } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function RequestSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
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

function EmptyState() {
  const t = useTranslations("requests");

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-surface-alt mb-5">
        <FileText className="size-7 text-muted-foreground/50" />
      </div>
      <h3 className="font-heading text-lg font-semibold text-brand-secondary mb-2">
        {t("noBids")}
      </h3>
      <p className="text-muted-foreground text-sm max-w-md mb-6">
        {t("subtitle")}
      </p>
      <Button
        asChild
        className="bg-gradient-primary text-white rounded-button font-semibold hover:opacity-90 transition-opacity"
      >
        <Link href="/solicitar">
          <PlusCircle className="size-4 mr-2" />
          {t("create")}
        </Link>
      </Button>
    </div>
  );
}

export function RequestsListContent() {
  const {
    data,
    isLoading,
  } = useSWR<{ requests: FlightRequestPreview[] }>("/api/requests", fetcher);

  const requests = data?.requests ?? [];

  if (isLoading) {
    return <RequestSkeletonGrid />;
  }

  if (requests.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {requests.map((request) => (
        <RequestCard key={request.id} request={request} />
      ))}
    </div>
  );
}
