type Point = { close: number | null };

export function Sparkline({ points, tone }: { points: Point[]; tone: "up" | "down" | "flat" }) {
  const values = points.map((point) => point.close).filter((value): value is number => value != null);
  if (values.length < 2) {
    return <svg width="88" height="32" aria-hidden="true" />;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const width = 88;
  const height = 32;
  const path = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / span) * (height - 4) - 2;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  const color = tone === "down" ? "#ef5d6a" : tone === "up" ? "#3ecf8e" : "#9aa7b5";
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <path d={path} fill="none" stroke={color} strokeWidth="1.6" />
    </svg>
  );
}
