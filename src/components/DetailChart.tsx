import { useMemo, useState } from "react";
import type { ChartPoint } from "../api";
import { formatDateTime, formatPrice } from "../lib/format";
import type { IndexItem } from "../data/catalog";

export function DetailChart({ points, item }: { points: ChartPoint[]; item: IndexItem }) {
  const [hover, setHover] = useState<number | null>(null);
  const series = useMemo(
    () => points.filter((point): point is ChartPoint & { close: number } => point.close != null),
    [points],
  );

  const geometry = useMemo(() => {
    if (series.length < 2) return null;
    const values = series.map((point) => point.close);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const width = 380;
    const height = 220;
    const coords = series.map((point, index) => {
      const x = 16 + (index / (series.length - 1)) * (width - 28);
      const y = 16 + (1 - (point.close - min) / span) * (height - 36);
      return { x, y, value: point.close, time: point.time };
    });
    const line = coords.map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`).join(" ");
    const area = `${line} L${coords[coords.length - 1].x} 212 L${coords[0].x} 212 Z`;
    return { coords, line, area, min, max, width, height };
  }, [series]);

  if (!geometry) {
    return <div className="empty">暂无走势数据</div>;
  }

  const active = hover == null ? geometry.coords[geometry.coords.length - 1] : geometry.coords[hover];
  const tone = (series[series.length - 1]?.close ?? 0) >= (series[0]?.close ?? 0) ? "#3ecf8e" : "#ef5d6a";

  return (
    <div>
      <div className="meta" style={{ marginBottom: 6 }}>
        {formatDateTime(active.time ? new Date(active.time).toISOString() : null)} · {formatPrice(active.value, item.kind)}
      </div>
      <svg
        width="100%"
        viewBox={`0 0 ${geometry.width} ${geometry.height}`}
        onMouseLeave={() => setHover(null)}
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const ratio = (event.clientX - rect.left) / rect.width;
          const index = Math.min(geometry.coords.length - 1, Math.max(0, Math.round(ratio * (geometry.coords.length - 1))));
          setHover(index);
        }}
      >
        <path d={geometry.area} fill={tone} opacity="0.12" />
        <path d={geometry.line} fill="none" stroke={tone} strokeWidth="2" />
        <circle cx={active.x} cy={active.y} r="3.5" fill={tone} />
      </svg>
    </div>
  );
}
