"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

export interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  background: string;
}

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  background,
}: FeatureCardProps) {
  // background SVG removed — no bgUrl computation

  return (
    <Card className="relative overflow-hidden bg-white rounded-2xl shadow-md border border-gray-100 p-8 text-center group transition-all duration-300 hover:shadow-lg">
      {/* background artwork removed */}

      <CardContent className="relative z-10 flex flex-col items-center gap-4">
        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br from-primary to-secondary">
          <Icon className="w-10 h-10 text-white" />
        </div>

        {/* Title */}
        <h3 className="text-2xl font-semibold text-gray-900">{title}</h3>

        {/* Description */}
        <p className="text-gray-500 leading-relaxed max-w-xs">{description}</p>
      </CardContent>
    </Card>
  );
}

// New named export: StatCard
export function StatCard({
  value,
  label,
  icon: Icon,
}: {
  value: string | number;
  label: string;
  icon?: LucideIcon;
}) {
  return (
    <Card className="p-4 rounded-lg shadow-sm border border-gray-100">
      <CardContent className="flex flex-col items-center gap-2">
        {Icon ? (
          <div className="w-10 h-10 flex items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="w-5 h-5" />
          </div>
        ) : null}
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}
