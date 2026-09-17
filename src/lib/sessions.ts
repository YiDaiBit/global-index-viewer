import type { SessionId } from "../data/catalog";

interface SessionDef {
  id: SessionId;
  label: string;
  timeZone: string;
  open: [number, number];
  close: [number, number];
  lunch?: [[number, number], [number, number]];
  alwaysOn?: boolean;
}

export const SESSIONS: SessionDef[] = [
  { id: "sydney", label: "悉尼", timeZone: "Australia/Sydney", open: [10, 0], close: [16, 0] },
  { id: "tokyo", label: "东京", timeZone: "Asia/Tokyo", open: [9, 0], close: [15, 0] },
  { id: "shanghai", label: "上海", timeZone: "Asia/Shanghai", open: [9, 30], close: [15, 0], lunch: [[11, 30], [13, 0]] },
  { id: "hongkong", label: "香港", timeZone: "Asia/Hong_Kong", open: [9, 30], close: [16, 0], lunch: [[12, 0], [13, 0]] },
  { id: "seoul", label: "首尔", timeZone: "Asia/Seoul", open: [9, 0], close: [15, 30] },
  { id: "taipei", label: "台北", timeZone: "Asia/Taipei", open: [9, 0], close: [13, 30] },
  { id: "singapore", label: "新加坡", timeZone: "Asia/Singapore", open: [9, 0], close: [17, 0] },
  { id: "mumbai", label: "孟买", timeZone: "Asia/Kolkata", open: [9, 15], close: [15, 30] },
  { id: "london", label: "伦敦", timeZone: "Europe/London", open: [8, 0], close: [16, 30] },
  { id: "europe", label: "欧洲大陆", timeZone: "Europe/Berlin", open: [9, 0], close: [17, 30] },
  { id: "newyork", label: "纽约", timeZone: "America/New_York", open: [9, 30], close: [16, 0] },
];

const SESSION_MAP: Record<SessionId, Omit<SessionDef, "id" | "label"> & { label?: string }> = {
  newyork: { timeZone: "America/New_York", open: [9, 30], close: [16, 0] },
  toronto: { timeZone: "America/Toronto", open: [9, 30], close: [16, 0] },
  saopaulo: { timeZone: "America/Sao_Paulo", open: [10, 0], close: [17, 0] },
  mexicocity: { timeZone: "America/Mexico_City", open: [8, 30], close: [15, 0] },
  buenosaires: { timeZone: "America/Argentina/Buenos_Aires", open: [11, 0], close: [17, 0] },
  london: { timeZone: "Europe/London", open: [8, 0], close: [16, 30] },
  europe: { timeZone: "Europe/Berlin", open: [9, 0], close: [17, 30] },
  tokyo: { timeZone: "Asia/Tokyo", open: [9, 0], close: [15, 0] },
  shanghai: { timeZone: "Asia/Shanghai", open: [9, 30], close: [15, 0], lunch: [[11, 30], [13, 0]] },
  hongkong: { timeZone: "Asia/Hong_Kong", open: [9, 30], close: [16, 0], lunch: [[12, 0], [13, 0]] },
  seoul: { timeZone: "Asia/Seoul", open: [9, 0], close: [15, 30] },
  taipei: { timeZone: "Asia/Taipei", open: [9, 0], close: [13, 30] },
  sydney: { timeZone: "Australia/Sydney", open: [10, 0], close: [16, 0] },
  mumbai: { timeZone: "Asia/Kolkata", open: [9, 15], close: [15, 30] },
  singapore: { timeZone: "Asia/Singapore", open: [9, 0], close: [17, 0] },
  kualalumpur: { timeZone: "Asia/Kuala_Lumpur", open: [9, 0], close: [17, 0] },
  auckland: { timeZone: "Pacific/Auckland", open: [10, 0], close: [16, 45] },
  bangkok: { timeZone: "Asia/Bangkok", open: [10, 0], close: [16, 30] },
  futures: { timeZone: "America/New_York", open: [18, 0], close: [17, 0], alwaysOn: true },
  crypto: { timeZone: "UTC", open: [0, 0], close: [23, 59], alwaysOn: true },
};

function zonedParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const read = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const weekday = read("weekday");
  let hour = Number(read("hour"));
  if (hour === 24) hour = 0;
  const minute = Number(read("minute"));
  return { weekday, hour, minute };
}

function minutes(hour: number, minute: number) {
  return hour * 60 + minute;
}

export function isSessionOpen(session: SessionId, now = new Date()): boolean {
  const def = SESSION_MAP[session];
  if (!def) return false;
  if (def.alwaysOn) return true;

  const { weekday, hour, minute } = zonedParts(now, def.timeZone);
  if (weekday === "Sat" || weekday === "Sun") return false;

  const current = minutes(hour, minute);
  const open = minutes(def.open[0], def.open[1]);
  const close = minutes(def.close[0], def.close[1]);
  if (current < open || current >= close) return false;
  if (def.lunch) {
    const lunchStart = minutes(def.lunch[0][0], def.lunch[0][1]);
    const lunchEnd = minutes(def.lunch[1][0], def.lunch[1][1]);
    if (current >= lunchStart && current < lunchEnd) return false;
  }
  return true;
}

export function formatZonedTime(timeZone: string, now = new Date()): string {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
}

export function sessionStatusLabel(session: SessionId, now = new Date()): string {
  if (SESSION_MAP[session]?.alwaysOn) return "全时";
  return isSessionOpen(session, now) ? "开盘" : "收盘";
}
