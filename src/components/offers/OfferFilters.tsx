"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { SlidersHorizontal, X } from "lucide-react";

const CATEGORIES = ["TOUR", "ONE_WAY", "ROUND_TRIP", "RETURN"] as const;

const CATEGORY_KEYS: Record<string, string> = {
  TOUR: "tour",
  ONE_WAY: "oneWay",
  ROUND_TRIP: "roundTrip",
  RETURN: "return",
};

export function OfferFilters() {
  const t = useTranslations("filters");
  const tOffers = useTranslations("offers");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCategories = searchParams.get("categories")?.split(",").filter(Boolean) ?? [];
  const priceMin = Number(searchParams.get("priceMin") ?? 0);
  const priceMax = Number(searchParams.get("priceMax") ?? 50000);
  const minCapacity = Number(searchParams.get("minCapacity") ?? 0);
  const emptyLegOnly = searchParams.get("emptyLegOnly") === "true";
  const sortBy = searchParams.get("sortBy") ?? "";

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "" || value === "0") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      const query = params.toString();
      router.push(`${pathname}${query ? `?${query}` : ""}` as never);
    },
    [searchParams, router, pathname]
  );

  function toggleCategory(category: string) {
    const current = new Set(selectedCategories);
    if (current.has(category)) {
      current.delete(category);
    } else {
      current.add(category);
    }
    const value = Array.from(current).join(",");
    updateParams({ categories: value || null });
  }

  function handlePriceChange(values: number[]) {
    updateParams({
      priceMin: values[0] > 0 ? String(values[0]) : null,
      priceMax: values[1] < 50000 ? String(values[1]) : null,
    });
  }

  function handleMinCapacityChange(value: string) {
    const num = parseInt(value, 10);
    updateParams({ minCapacity: num > 0 ? String(num) : null });
  }

  function handleEmptyLegToggle(checked: boolean) {
    updateParams({ emptyLegOnly: checked ? "true" : null });
  }

  function handleSortChange(value: string) {
    updateParams({ sortBy: value || null });
  }

  function clearFilters() {
    router.push(pathname as never);
  }

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    priceMin > 0 ||
    priceMax < 50000 ||
    minCapacity > 0 ||
    emptyLegOnly ||
    sortBy !== "";

  return (
    <aside className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-brand-primary" />
          <h3 className="font-heading font-semibold text-brand-secondary">
            {t("title")}
          </h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="xs"
            onClick={clearFilters}
            className="text-muted-foreground"
          >
            <X className="size-3" />
            {t("clearFilters")}
          </Button>
        )}
      </div>

      {/* Category checkboxes */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">
          {t("category")}
        </Label>
        <div className="space-y-2">
          {CATEGORIES.map((category) => (
            <div key={category} className="flex items-center gap-2.5">
              <Checkbox
                id={`cat-${category}`}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
              />
              <label
                htmlFor={`cat-${category}`}
                className="text-sm cursor-pointer select-none"
              >
                {tOffers(CATEGORY_KEYS[category])}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Price range slider */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">
          {t("priceRange")}
        </Label>
        <Slider
          min={0}
          max={50000}
          step={500}
          value={[priceMin, priceMax]}
          onValueChange={handlePriceChange}
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatCurrency(priceMin)}</span>
          <span>{formatCurrency(priceMax)}</span>
        </div>
      </div>

      {/* Minimum capacity */}
      <div className="space-y-3">
        <Label htmlFor="minCapacity" className="text-sm font-medium text-foreground">
          {t("minCapacity")}
        </Label>
        <Input
          id="minCapacity"
          type="number"
          min={0}
          max={50}
          value={minCapacity || ""}
          onChange={(e) => handleMinCapacityChange(e.target.value)}
          placeholder="0"
          className="h-9"
        />
      </div>

      {/* Empty leg switch */}
      <div className="flex items-center justify-between">
        <Label htmlFor="emptyLegOnly" className="text-sm font-medium text-foreground cursor-pointer">
          {t("emptyLegOnly")}
        </Label>
        <Switch
          id="emptyLegOnly"
          checked={emptyLegOnly}
          onCheckedChange={handleEmptyLegToggle}
        />
      </div>

      {/* Sort by */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">
          {t("sortBy")}
        </Label>
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("sortBy")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price_asc">{t("sortPriceAsc")}</SelectItem>
            <SelectItem value="price_desc">{t("sortPriceDesc")}</SelectItem>
            <SelectItem value="date_asc">{t("sortDateAsc")}</SelectItem>
            <SelectItem value="date_desc">{t("sortDateDesc")}</SelectItem>
            <SelectItem value="newest">{t("sortNewest")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </aside>
  );
}
