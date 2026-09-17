export interface Quote {
  symbol: string;
  price: number | null;
  change: number | null;
  changePct: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  previousClose: number | null;
  yearHigh: number | null;
  yearLow: number | null;
  currency: string;
  asOf: string | null;
  marketStatus: string | null;
  shortName: string;
}

export interface ChartPoint {
  time: number;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number;
}

export async function fetchQuotes(symbols: string[]): Promise<Record<string, Quote>> {
  const response = await fetch(`/api/quotes?symbols=${encodeURIComponent(symbols.join(","))}`);
  if (!response.ok) throw new Error("quotes_failed");
  const data = (await response.json()) as { quotes: Record<string, Quote> };
  return data.quotes ?? {};
}

export async function fetchChart(symbol: string, range: string): Promise<ChartPoint[]> {
  const response = await fetch(`/api/chart?symbol=${encodeURIComponent(symbol)}&range=${encodeURIComponent(range)}`);
  if (!response.ok) throw new Error("chart_failed");
  const data = (await response.json()) as { points: ChartPoint[] };
  return data.points ?? [];
}
