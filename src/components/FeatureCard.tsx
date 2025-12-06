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
  // ensure public/bg paths are used correctly:
  const bgUrl =
    typeof background === "string"
      ? background.startsWith("/") || background.startsWith("http")
        ? background
        : `/${background}`
      : "";

  return (
    <Card className="relative overflow-hidden bg-white rounded-2xl shadow-md border border-gray-100 p-8 text-center group transition-all duration-300 hover:shadow-lg">
      {/* Background Line Art */}
      <div
        className="absolute inset-0 opacity-[0.08] group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          backgroundImage: bgUrl ? `url(${bgUrl})` : undefined,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "80%",
        }}
      />

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
