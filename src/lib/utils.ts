import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyExact(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function generateSlug(origin: string, destination: string | null, date: Date): string {
  const parts = [origin.toLowerCase().replace(/\s+/g, "-")];
  if (destination) {
    parts.push(destination.toLowerCase().replace(/\s+/g, "-"));
  }
  const dateStr = date.toISOString().split("T")[0];
  parts.push(dateStr);
  const random = Math.random().toString(36).substring(2, 6);
  parts.push(random);
  return parts.join("-");
}
