"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

type DeferredProgressChartsProps = {
  measurements: Array<{
    label: string;
    weight: number;
    waist: number | null;
    arm: number | null;
  }>;
  strength: Array<{
    label: string;
    volume: number;
    topSet: number;
  }>;
};

function ProgressChartsSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {[0, 1].map((index) => (
        <div key={index} className="panel-dark p-5">
          <div className="animate-pulse">
            <div className="h-3 w-28 rounded-full bg-white/10" />
            <div className="mt-4 h-8 w-52 rounded-full bg-white/12" />
            <div className="mt-6 h-64 rounded-[22px] bg-white/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

const ProgressCharts = dynamic(
  () =>
    import("@/components/progress-charts").then(
      (module) => module.ProgressCharts,
    ),
  {
    ssr: false,
    loading: ProgressChartsSkeleton,
  },
);

export function DeferredProgressCharts({
  measurements,
  strength,
}: DeferredProgressChartsProps) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (shouldLoad) {
      return;
    }

    const node = containerRef.current;
    if (!node) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px" },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [shouldLoad]);

  return (
    <div ref={containerRef}>
      {shouldLoad ? (
        <ProgressCharts measurements={measurements} strength={strength} />
      ) : (
        <ProgressChartsSkeleton />
      )}
    </div>
  );
}
