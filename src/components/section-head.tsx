"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type SectionHeadProps = {
  eyebrow: string;
  title: string;
  description: string;
  dark?: boolean;
};

export function SectionHead({
  eyebrow,
  title,
  description,
  dark = false,
}: SectionHeadProps) {
  return (
    <div>
      <span
        className={cn(
          "eyebrow",
          dark
            ? "border-white/12 text-white/65"
            : "border-black/8 text-[var(--muted-light)]",
        )}
      >
        <Sparkles className="h-3.5 w-3.5" />
        {eyebrow}
      </span>
      <h2
        className={cn(
          "mt-4 text-3xl leading-tight font-[family:var(--font-sora)] sm:text-4xl",
          dark ? "text-white" : "text-[#191714]",
        )}
      >
        {title}
      </h2>
      <p
        className={cn(
          "mt-3 max-w-2xl text-sm leading-7 sm:text-base",
          dark ? "text-white/65" : "text-[var(--muted-light)]",
        )}
      >
        {description}
      </p>
    </div>
  );
}
