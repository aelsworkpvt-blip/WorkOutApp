"use client";

import { useSyncExternalStore } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ProgressChartsProps = {
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

export function ProgressCharts({
  measurements,
  strength,
}: ProgressChartsProps) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="panel-dark h-80 p-5" />
        <div className="panel-dark h-80 p-5" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="panel-dark p-5">
        <div className="mb-4">
          <p className="text-sm uppercase tracking-[0.25em] text-white/50">
            Weekly measurements
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">
            Weight and waist trend
          </h3>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={measurements}>
              <defs>
                <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffd54f" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#ffd54f" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#141925",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "18px",
                  color: "#f5f7ff",
                }}
              />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="#ffd54f"
                fill="url(#weightFill)"
                strokeWidth={3}
              />
              <Area
                type="monotone"
                dataKey="waist"
                stroke="#74d3c4"
                fillOpacity={0}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel-dark p-5">
        <div className="mb-4">
          <p className="text-sm uppercase tracking-[0.25em] text-white/50">
            Strength trend
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">
            Volume and top-set intensity
          </h3>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={strength}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#141925",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "18px",
                  color: "#f5f7ff",
                }}
              />
              <Bar
                dataKey="volume"
                fill="#79d2c0"
                radius={[12, 12, 0, 0]}
              />
              <Bar
                dataKey="topSet"
                fill="#ff9f68"
                radius={[12, 12, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
