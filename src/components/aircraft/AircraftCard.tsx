"use client";

import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Users, Zap, Shield, Plane } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

export type AircraftPreview = {
  id: string;
  type: "PLANE" | "HELICOPTER";
  model: string;
  capacity: number;
  images: string[];
  hourlyRate: number;
  baseAirport: string;
  baseAirportName: string;
  cruiseSpeedKmh: number;
  amenities: string[];
  operator: {
    name: string;
    companyName: string | null;
    verified: boolean;
  };
};

interface AircraftCardProps {
  aircraft: AircraftPreview;
  className?: string;
}

export function AircraftCard({ aircraft, className }: AircraftCardProps) {
  return (
    <Link href={`/aeronave/${aircraft.id}`} className="block group">
      <Card
        className={cn(
          "overflow-hidden rounded-card border-surface-border bg-white cursor-pointer",
          "transition-all duration-200 ease-out",
          "hover:shadow-[0_12px_40px_rgba(27,73,101,0.15)] hover:-translate-y-1 hover:scale-[1.02]",
          className
        )}
      >
        {/* Image — 16:10 ratio */}
        <div
          className="relative w-full overflow-hidden bg-gradient-to-br from-brand-secondary via-brand-secondary-light to-brand-primary"
          style={{ paddingBottom: "62.5%" }}
        >
          <div className="absolute inset-0">
            {aircraft.images.length > 0 ? (
              <img
                src={aircraft.images[0]}
                alt={aircraft.model}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Plane className="size-14 text-white/20" />
              </div>
            )}
          </div>

          {/* Verified badge */}
          {aircraft.operator.verified && (
            <div className="absolute left-3 top-3">
              <Badge className="bg-brand-success/90 backdrop-blur-sm text-white border-0 text-xs font-semibold gap-1">
                <Shield className="size-3" />
                Verificado
              </Badge>
            </div>
          )}

          {/* Type badge */}
          <div className="absolute right-3 top-3">
            <Badge variant="outline" className="bg-white/90 backdrop-blur-sm border-0 text-xs font-medium">
              {aircraft.type === "PLANE" ? "✈ Avión" : "🚁 Helicóptero"}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4 space-y-2.5">
          {/* Model */}
          <h3 className="font-heading font-bold text-foreground text-base leading-tight">
            {aircraft.model}
          </h3>

          {/* Base airport */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5 text-brand-primary shrink-0" />
            <span className="truncate">{aircraft.baseAirportName} ({aircraft.baseAirport})</span>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="size-3" />
              Hasta {aircraft.capacity} pas.
            </span>
            <span className="flex items-center gap-1">
              <Zap className="size-3" />
              {aircraft.cruiseSpeedKmh} km/h
            </span>
          </div>

          {/* Price & Operator */}
          <div className="flex items-end justify-between border-t border-surface-border pt-2.5 mt-1">
            <div>
              <p className="text-xl font-bold text-brand-primary font-mono leading-none">
                {formatCurrency(aircraft.hourlyRate)}
              </p>
              <p className="text-xs text-muted-foreground">/hora de vuelo</p>
            </div>
            <span className="text-xs text-muted-foreground truncate max-w-[100px]">
              {aircraft.operator.companyName || aircraft.operator.name}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
