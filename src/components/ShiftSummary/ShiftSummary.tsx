"use client";

import Panel from "@/components/shared/Panel/Panel";
import styles from "./ShiftSummary.module.css";
import { ShiftHighlight } from "@/types/shift";
import { renderText } from "@/utils/common";
import { TodayShiftSummary } from "@/types/overview";
import { useAdminConfigStore } from "@/store/adminConfigStore";
import { KPI_IDS } from "@/lib/admin-config-data";

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

const highlightBandColor: Record<ShiftHighlight["band"], string> = {
  good: "var(--color-accent)",
  warn: "var(--color-amber)",
  bad: "var(--color-danger)",
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
  shiftSummary,
  highlights,
  highlightsGenerating,
  previewMode,
}: {
  shiftSummary: TodayShiftSummary;
  highlights: ShiftHighlight[];
  highlightsGenerating: boolean;
  previewMode?: boolean;
}) {
  const visible = useAdminConfigStore((s) => s.visibility[KPI_IDS.employeeShiftSummary] ?? true);
  if (!previewMode && !visible) return null;

  if (shiftSummary.shift_status === "no_data") {
    return (
      <Panel title="Today's Shift Summary" subtitle={shiftSummary.shift_date_display}>
        <div className="flex flex-col items-center justify-center gap-2 py-8">
          <span className="text-[28px]">🕐</span>
          <p className="text-[12.5px] font-semibold">No shift data yet</p>
          <p className="text-[11.5px] text-muted">Your shift summary will appear once a shift is logged.</p>
        </div>
      </Panel>
    );
  }

  const subtitle = `${shiftSummary.shift_date_display} · ${shiftSummary.shift_time_range}`;

  const scoreDiff = shiftSummary.overall_score_delta;
  const scoreDiffLabel =
    scoreDiff == null
      ? "→ No 30-day avg yet"
      : scoreDiff > 0
        ? `↑ +${scoreDiff} vs. your avg`
        : scoreDiff < 0
          ? `↓ ${scoreDiff} vs. your avg`
          : `→ same as your avg`;
  const scoreDiffClass = scoreDiff == null || scoreDiff === 0 ? "flat" : scoreDiff > 0 ? "up" : "down";

  const customersDiff = shiftSummary.customers_served_delta;
  const customersDiffLabel =
    customersDiff == null
      ? "→ No avg shift yet"
      : customersDiff > 0
        ? `↑ +${customersDiff}% vs. avg shift`
        : customersDiff < 0
          ? `↓ ${customersDiff}% vs. avg shift`
          : `→ same as avg shift`;
  const customersDiffClass = customersDiff == null || customersDiff === 0 ? "flat" : customersDiff > 0 ? "up" : "down";

  const avgCheckoutSeconds = shiftSummary.avg_checkout_seconds;
  const checkoutDiff = avgCheckoutSeconds == null ? null : shiftSummary.checkout_target_seconds - avgCheckoutSeconds;
  const checkoutDiffLabel =
    checkoutDiff == null
      ? "→ No checkout data"
      : checkoutDiff > 0
        ? `↓ ${checkoutDiff.toFixed(1)}s under target`
        : checkoutDiff < 0
          ? `↑ ${Math.abs(checkoutDiff).toFixed(1)}s over target`
          : `→ At target`;
  const checkoutDiffClass = checkoutDiff == null || checkoutDiff === 0 ? "flat" : checkoutDiff > 0 ? "up" : "down";

  const badge =
    shiftSummary.shift_status === "complete" ? (
      <span className="bg-accent-light text-accent font-semibold rounded-[20px] text-[11px] px-[9px] py-[3px]">
        Shift complete
      </span>
    ) : (
      <span className="bg-amber-light text-amber font-semibold rounded-[20px] text-[11px] px-[9px] py-[3px]">
        Shift in progress
      </span>
    );

  return (
    <Panel title="Today's Shift Summary" subtitle={subtitle} badge={badge}>
      <div
        className="grid gap-[10px]"
        style={{ gridTemplateColumns: "1fr 1fr" }}
      >
        <MetricCard
          label="Overall Score"
          value={shiftSummary.overall_score}
          change={scoreDiffLabel}
          valueClass="good"
          changeClass={scoreDiffClass}
        />
        <MetricCard
          label="Customers Served"
          value={shiftSummary.customers_served}
          change={customersDiffLabel}
          valueClass="great"
          changeClass={customersDiffClass}
        />
        <MetricCard
          label="Avg Checkout"
          value={avgCheckoutSeconds == null ? "—" : `${avgCheckoutSeconds}s`}
          change={checkoutDiffLabel}
          valueClass={checkoutDiffClass === "down" ? "ok" : "great"}
          changeClass={checkoutDiffClass}
        />
        <MetricCard
          label="Points Earned"
          value={`+${shiftSummary.points_earned}`}
          change={shiftSummary.is_best_shift_this_week ? "↑ Best shift this week" : "→ Shift complete"}
          valueClass="great"
          changeClass={shiftSummary.is_best_shift_this_week ? "up" : "flat"}
        />
      </div>

      {highlights.length > 0 ? (
        <div className="flex flex-col border border-border rounded-[10px] overflow-hidden mt-[14px]">
          {highlights.map((event, idx) => (
            <div
              key={`${event.time}-${idx}`}
              className="flex items-start gap-[10px] border-b border-border px-[14px] py-[10px] last:border-b-0"
            >
              <div className="font-mono text-muted shrink-0 text-[10.5px] w-[38px] mt-px">
                {event.time}
              </div>
              <div
                className="rounded-full shrink-0 w-2 h-2 mt-1"
                style={{ background: highlightBandColor[event.band] }}
              />
              <div
                className={`${styles.eventText} text-secondary leading-snug flex-1 text-[12px]`}
              >
                {renderText(event.text)}
              </div>
              <div
                className="font-mono font-bold shrink-0 text-[12px]"
                style={{ color: highlightBandColor[event.band] }}
              >
                {event.score}
              </div>
            </div>
          ))}
        </div>
      ) : highlightsGenerating ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8 mt-[14px] border border-border rounded-[10px]">
          <span className="text-[24px]">⏳</span>
          <p className="text-[12.5px] font-semibold">Generating your shift timeline…</p>
          <p className="text-[11.5px] text-muted">Check back shortly — this only takes a moment.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 py-8 mt-[14px] border border-border rounded-[10px]">
          <p className="text-[11.5px] text-muted">Your shift timeline will appear here once you&apos;ve served a few customers.</p>
        </div>
      )}
    </Panel>
  );
}
