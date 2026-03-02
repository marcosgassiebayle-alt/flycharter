import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Plane,
  MessageSquare,
  ArrowLeft,
  ArrowRight,
  Clock,
  User,
  Mail,
  Phone,
} from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return {
    title: t("requestDetailTitle"),
    description: t("requestDetailDescription"),
  };
}

const MOCK_REQUEST: {
  id: string;
  status: string;
  vehicleType: string;
  category: string;
  origin: string;
  originCode: string;
  destination: string | null;
  destinationCode: string | null;
  departureDate: string;
  returnDate: string | null;
  passengersCount: number;
  budgetMin: number | null;
  budgetMax: number | null;
  notes: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  bidsCount: number;
  createdAt: string;
} = {
  id: "req-001",
  status: "OPEN",
  vehicleType: "PLANE",
  category: "ROUND_TRIP",
  origin: "Buenos Aires",
  originCode: "AEP",
  destination: "San Carlos de Bariloche",
  destinationCode: "BRC",
  departureDate: "2026-04-15T10:00:00Z",
  returnDate: "2026-04-20T16:00:00Z",
  passengersCount: 4,
  budgetMin: 3000,
  budgetMax: 6000,
  notes:
    "Viajamos en familia con 2 niños. Necesitamos flexibilidad con el horario de regreso. Preferimos salir temprano a la mañana.",
  customerName: "María García",
  customerEmail: "maria@email.com",
  customerPhone: "+54 11 5555-1234",
  bidsCount: 2,
  createdAt: "2026-03-01T14:30:00Z",
};

const STATUS_STYLES: Record<string, string> = {
  OPEN: "bg-brand-success text-white border-0",
  BOOKED: "bg-brand-secondary text-white border-0",
  EXPIRED: "bg-muted text-muted-foreground",
  CANCELLED: "bg-brand-error text-white border-0",
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SolicitudDetailPage({ params }: Props) {
  const { id } = await params;
  const t = await getTranslations("requestDetail");

  const request = { ...MOCK_REQUEST, id };

  const departureDate = new Date(request.departureDate);
  const formattedDeparture = departureDate.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const returnDateObj = request.returnDate
    ? new Date(request.returnDate)
    : null;
  const formattedReturn = returnDateObj
    ? returnDateObj.toLocaleDateString("es-AR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const createdDate = new Date(request.createdAt);
  const formattedCreated = createdDate.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const vehicleLabel =
    request.vehicleType === "PLANE"
      ? t("plane")
      : request.vehicleType === "HELICOPTER"
        ? t("helicopter")
        : t("anyVehicle");

  const categoryLabel =
    request.category === "TOUR"
      ? t("tour")
      : request.category === "ONE_WAY"
        ? t("oneWay")
        : request.category === "ROUND_TRIP"
          ? t("roundTrip")
          : t("returnOnly");

  const statusKey = request.status.toLowerCase() as
    | "open"
    | "booked"
    | "expired"
    | "cancelled";

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 py-10">
      {/* Back link */}
      <Link
        href="/solicitudes"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand-primary transition-colors mb-6"
      >
        <ArrowLeft className="size-4" />
        {t("backToRequests")}
      </Link>

      {/* Page title row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-brand-secondary">
            {t("pageTitle")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            ID: {request.id}
          </p>
        </div>
        <Badge className={`${STATUS_STYLES[request.status] || ""} text-sm px-4 py-1`}>
          {t(statusKey)}
        </Badge>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Route card */}
          <Card className="rounded-card border-surface-border shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-brand-secondary to-brand-secondary-light p-6 text-white">
              <p className="text-sm font-medium text-white/70 mb-3">
                {t("route")}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <MapPin className="size-5" />
                  <span className="text-xl font-bold">
                    {request.origin} ({request.originCode})
                  </span>
                </div>
                {request.destination && (
                  <>
                    <ArrowRight className="size-5 text-white/60" />
                    <div className="flex items-center gap-2">
                      <MapPin className="size-5" />
                      <span className="text-xl font-bold">
                        {request.destination} ({request.destinationCode})
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>

          {/* Flight info card */}
          <Card className="rounded-card border-surface-border shadow-sm">
            <CardHeader>
              <CardTitle className="font-heading text-lg text-brand-secondary flex items-center gap-2">
                <Plane className="size-5 text-brand-primary" />
                {t("flightInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    {t("vehicleType")}
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {vehicleLabel}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    {t("category")}
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {categoryLabel}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    {t("departureDate")}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-4 text-brand-primary" />
                    <p className="text-sm font-semibold text-foreground capitalize">
                      {formattedDeparture}
                    </p>
                  </div>
                </div>
                {formattedReturn && (
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                      {t("returnDate")}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-4 text-brand-secondary" />
                      <p className="text-sm font-semibold text-foreground capitalize">
                        {formattedReturn}
                      </p>
                    </div>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    {t("passengers")}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Users className="size-4 text-brand-primary" />
                    <p className="text-sm font-semibold text-foreground">
                      {request.passengersCount}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    {t("budget")}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="size-4 text-brand-accent" />
                    <p className="text-sm font-semibold text-foreground">
                      {request.budgetMin && request.budgetMax
                        ? `${formatCurrency(request.budgetMin)} - ${formatCurrency(request.budgetMax)}`
                        : request.budgetMin
                          ? `${formatCurrency(request.budgetMin)}+`
                          : request.budgetMax
                            ? formatCurrency(request.budgetMax)
                            : t("notSpecified")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes card */}
          <Card className="rounded-card border-surface-border shadow-sm">
            <CardHeader>
              <CardTitle className="font-heading text-lg text-brand-secondary flex items-center gap-2">
                <MessageSquare className="size-5 text-brand-primary" />
                {t("notesTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {request.notes ? (
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {request.notes}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  {t("noNotes")}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status card */}
          <Card className="rounded-card border-surface-border shadow-sm">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  {t("status")}
                </p>
                <Badge
                  className={`${STATUS_STYLES[request.status] || ""} text-sm`}
                >
                  {t(statusKey)}
                </Badge>
              </div>
              <Separator />
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  {t("createdAt")}
                </p>
                <div className="flex items-center gap-1.5 text-sm text-foreground">
                  <Clock className="size-4 text-muted-foreground" />
                  {formattedCreated}
                </div>
              </div>
              <Separator />
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  {t("bidsReceived")}
                </p>
                <p className="text-2xl font-bold text-brand-primary">
                  {request.bidsCount}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact info card */}
          <Card className="rounded-card border-surface-border shadow-sm">
            <CardHeader>
              <CardTitle className="font-heading text-lg text-brand-secondary flex items-center gap-2">
                <User className="size-5 text-brand-primary" />
                {t("contactInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="size-4 text-muted-foreground shrink-0" />
                <span className="font-medium">{request.customerName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="size-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">
                  {request.customerEmail}
                </span>
              </div>
              {request.customerPhone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="size-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">
                    {request.customerPhone}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* CTA card */}
          <Card className="rounded-card border-surface-border shadow-sm overflow-hidden">
            <div className="bg-gradient-to-br from-brand-primary to-brand-accent-alt p-6 text-white text-center">
              <Plane className="size-10 mx-auto mb-3" />
              <h3 className="font-heading text-lg font-bold mb-2">
                {t("bidCta")}
              </h3>
              <p className="text-sm text-white/80 mb-4">
                {t("bidCtaDesc")}
              </p>
              <Button
                asChild
                className="bg-white text-brand-primary font-semibold rounded-button hover:bg-white/90 transition-colors w-full"
              >
                <Link href="/auth/login">
                  {t("bidCta")}
                  <ArrowRight className="size-4 ml-1" />
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
