"use client";

interface EmptyLegBadgeProps {
  discountPercent: number;
}

export function EmptyLegBadge({ discountPercent }: EmptyLegBadgeProps) {
  return (
    <span className="bg-brand-primary text-white rounded-full px-3 py-1 text-xs font-semibold inline-flex items-center gap-1">
      🔥 Empty Leg -{discountPercent}%
    </span>
  );
}
