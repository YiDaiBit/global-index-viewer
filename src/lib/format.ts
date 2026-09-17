export function parseNumber(value: string | number | null | undefined): number | null {
  if (value == null || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === "N/A" || trimmed === "--") return null;
  if (trimmed === "UNCH") return 0;
  const normalized = trimmed.replace(/[,%]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatPrice(value: number | null, kind: "index" | "yield" | "crypto" | "commodity" | "fx"): string {
  if (value == null) return "--";
  if (kind === "yield") return `${value.toFixed(3)}%`;
  if (kind === "crypto") {
    return value >= 1000
      ? value.toLocaleString("en-US", { maximumFractionDigits: 2 })
      : value.toLocaleString("en-US", { maximumFractionDigits: 4 });
  }
  if (kind === "commodity" || kind === "fx") {
    return value >= 100
      ? value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  }
  if (value >= 1000) {
    return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 3 });
}

export function formatChange(value: number | null, kind: "index" | "yield" | "crypto" | "commodity" | "fx"): string {
  if (value == null) return "--";
  const sign = value > 0 ? "+" : "";
  if (kind === "yield") return `${sign}${value.toFixed(4)}`;
  return `${sign}${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPercent(value: number | null): string {
  if (value == null) return "--";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function changeTone(value: number | null): "up" | "down" | "flat" {
  if (value == null || Math.abs(value) < 1e-8) return "flat";
  return value > 0 ? "up" : "down";
}

export function formatClock(date: Date): string {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatDateTime(value: string | null): string {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatChartDate(time: number, withTime = false): string {
  if (!time) return "--";
  const date = new Date(time);
  if (Number.isNaN(date.getTime())) return "--";
  const parts = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const read = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const label = `${read("year")}年${read("month")}月${read("day")}日`;
  if (!withTime) return label;
  return `${label} ${read("hour")}:${read("minute")}`;
}
