"use client";

import Panel from "@/components/shared/Panel/Panel";
import styles from "./ShiftSummary.module.css";
import { ShiftSummaryData } from "@/types/shift";
import { renderText } from "@/utils/common";
import { WeeklyStats } from "@/types/overview";

const metricValClass: Record<string, string> = {
  good: "text-accent",
  great: "text-accent",
  ok: "text-amber",
  gold: "text-[var(--color-gold)]",
};

const metricChangeClass: Record<string, string> = {
  up: "text-accent",
  down: "text-danger",
  flat: "text-muted",
};

function MetricCard({
  label,
  value,
  change,
  valueClass,
  changeClass,
}: {
  label: string;
  value: string | number;
  change: string;
  valueClass: keyof typeof metricValClass;
  changeClass: keyof typeof metricChangeClass;
}) {
  return (
    <div className="flex flex-col bg-surface-alt rounded-[10px] px-[15px] py-[13px] gap-1">
      <div className="uppercase tracking-[.08em] text-muted text-[10px]">{label}</div>
      <div className={`font-mono font-bold leading-none text-[22px] ${metricValClass[valueClass]}`}>
        {value}
      </div>
      <div className={`font-semibold text-[11px] ${metricChangeClass[changeClass]}`}>
        {change}
      </div>
    </div>
  );
}

export default function ShiftSummary({
  data,
  weeklyStats,
}: {
  data: ShiftSummaryData;
  weeklyStats: WeeklyStats;
}) {
  const scoreDiff = weeklyStats.current_score - weeklyStats.avg_score;
  const scoreDiffLabel =
    scoreDiff > 0
      ? `↑ +${scoreDiff} vs. your avg`
      : scoreDiff < 0
        ? `↓ ${scoreDiff} vs. your avg`
        : `→ same as your avg`;
  const scoreDiffClass = scoreDiff > 0 ? "up" : scoreDiff < 0 ? "down" : "flat";

  const badge = data.shiftComplete ? (
    <span className="bg-accent-light text-accent font-semibold rounded-[20px] text-[11px] px-[9px] py-[3px]">
      Shift complete
    </span>
  ) : null;

  return (
    <Panel title={data.title} subtitle={data.subtitle} badge={badge}>
      <div
        className="grid gap-[10px]"
        style={{ gridTemplateColumns: "1fr 1fr" }}
      >
        <MetricCard
          label="Overall Score"
          value={weeklyStats.current_score}
          change={scoreDiffLabel}
          valueClass="good"
          changeClass={scoreDiffClass}
        />
        <MetricCard
          label="Customers Served"
          value={weeklyStats.customers_served}
          change="↑ +12 vs. avg shift"
          valueClass="great"
          changeClass="up"
        />
        <MetricCard
          label="Avg Checkout"
          value="31s"
          change="→ Target is 25s"
          valueClass="ok"
          changeClass="flat"
        />
        <MetricCard
          label="Points Earned"
          value={`+${weeklyStats.avg_score}`}
          change="↑ Best shift this week"
          valueClass="great"
          changeClass="up"
        />
      </div>

      <div className="flex flex-col border border-border rounded-[10px] overflow-hidden mt-[14px]">
        {data.timeline.map((event) => (
          <div
            key={event.time}
            className="flex items-start gap-[10px] border-b border-border px-[14px] py-[10px] last:border-b-0"
          >
            <div className="font-mono text-muted shrink-0 text-[10.5px] w-[38px] mt-px">
              {event.time}
            </div>
            <div
              className="rounded-full shrink-0 w-2 h-2 mt-1"
              style={{ background: event.dotColor }}
            />
            <div
              className={`${styles.eventText} text-secondary leading-snug flex-1 text-[12px]`}
            >
              {renderText(event.text)}
            </div>
            <div
              className="font-mono font-bold shrink-0 text-[12px]"
              style={{ color: event.scoreColor }}
            >
              {event.score}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
