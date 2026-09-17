import { useMemo, useState } from "react";
import type { ChartPoint } from "../api";
import { formatChartDate, formatPrice } from "../lib/format";
import type { IndexItem } from "../data/catalog";

export function DetailChart({
  points,
  item,
  range,
}: {
  points: ChartPoint[];
  item: IndexItem;
  range: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const series = useMemo(
    () => points.filter((point): point is ChartPoint & { close: number } => point.close != null),
    [points],
  );
  const showTime = range === "1d" || range === "5d";

  const geometry = useMemo(() => {
    if (series.length < 2) return null;
    const values = series.map((point) => point.close);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const width = 720;
    const height = 320;
    const coords = series.map((point, index) => {
      const x = 20 + (index / (series.length - 1)) * (width - 36);
      const y = 18 + (1 - (point.close - min) / span) * (height - 40);
      return { x, y, value: point.close, time: point.time };
    });
    const line = coords.map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`).join(" ");
    const area = `${line} L${coords[coords.length - 1].x} ${height - 8} L${coords[0].x} ${height - 8} Z`;
    return { coords, line, area, width, height };
  }, [series]);

  if (!geometry) {
    return <div className="empty">暂无走势数据</div>;
  }

  const active = hover == null ? geometry.coords[geometry.coords.length - 1] : geometry.coords[hover];
  const tone = (series[series.length - 1]?.close ?? 0) >= (series[0]?.close ?? 0) ? "#3ecf8e" : "#ef5d6a";

  return (
    <div className="chart-canvas">
      <svg
        width="100%"
        viewBox={`0 0 ${geometry.width} ${geometry.height}`}
        onMouseLeave={() => {
          setHover(null);
          setPointer(null);
        }}
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const ratio = (event.clientX - rect.left) / rect.width;
          const index = Math.min(geometry.coords.length - 1, Math.max(0, Math.round(ratio * (geometry.coords.length - 1))));
          setHover(index);
          setPointer({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          });
        }}
      >
        <path d={geometry.area} fill={tone} opacity="0.12" />
        <path d={geometry.line} fill="none" stroke={tone} strokeWidth="2" />
        {hover != null && (
          <line
            x1={active.x}
            y1="10"
            x2={active.x}
            y2={geometry.height - 8}
            stroke="rgba(232, 238, 244, 0.28)"
            strokeDasharray="4 4"
          />
        )}
        <circle cx={active.x} cy={active.y} r="4" fill={tone} />
      </svg>
      {hover != null && pointer && (
        <div className="chart-tip" style={{ left: pointer.x, top: pointer.y }}>
          <strong>{formatChartDate(active.time, showTime)}</strong>
          <span>{formatPrice(active.value, item.kind)}</span>
        </div>
      )}
    </div>
  );
}
