import type { Plugin, PreviewServer, ViteDevServer } from "vite";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const QUOTE_URL = "https://quote.cnbc.com/quote-html-webservice/restQuote/symbolType/symbol";
const CHART_URL = "https://ts-api.cnbc.com/harmony/app/bars";

const ALLOWED_RANGE = new Set(["1d", "5d", "1mo", "6mo", "1y", "5y"]);
const SYMBOL_RE = /^[A-Za-z0-9.=@|_-]{1,24}$/;

interface CnbcQuote {
  symbol?: string;
  code?: number | string;
  last?: string;
  change?: string;
  change_pct?: string;
  open?: string;
  high?: string;
  low?: string;
  previous_day_closing?: string;
  yrhiprice?: string;
  yrloprice?: string;
  currencyCode?: string;
  last_time?: string;
  curmktstatus?: string;
  shortName?: string;
  name?: string;
}

interface PriceBar {
  open?: string;
  high?: string;
  low?: string;
  close?: string;
  volume?: number;
  tradeTimeinMills?: number;
}

function json(res: { statusCode?: number; setHeader: (k: string, v: string) => void; end: (b: string) => void }, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function readUrl(req: { url?: string }, host: string) {
  return new URL(req.url ?? "/", `http://${host}`);
}

function parseNumber(value: string | number | null | undefined): number | null {
  if (value == null || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === "N/A" || trimmed === "--") return null;
  if (trimmed === "UNCH") return 0;
  const parsed = Number(trimmed.replace(/[,%]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function stamp(date: Date, endOfDay = false) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return endOfDay ? `${y}${m}${d}235959` : `${y}${m}${d}000000`;
}

function rangeWindow(range: string) {
  const end = new Date();
  const start = new Date(end);
  let bar = "1D";
  switch (range) {
    case "1d":
      start.setUTCDate(end.getUTCDate() - 2);
      bar = "5M";
      break;
    case "5d":
      start.setUTCDate(end.getUTCDate() - 7);
      bar = "15M";
      break;
    case "1mo":
      start.setUTCMonth(end.getUTCMonth() - 1);
      break;
    case "6mo":
      start.setUTCMonth(end.getUTCMonth() - 6);
      break;
    case "1y":
      start.setUTCFullYear(end.getUTCFullYear() - 1);
      break;
    case "5y":
      start.setUTCFullYear(end.getUTCFullYear() - 5);
      bar = "1W";
      break;
    default:
      start.setUTCMonth(end.getUTCMonth() - 1);
  }
  return { start: stamp(start), end: stamp(end, true), bar };
}

async function fetchQuotes(symbols: string[]) {
  const unique = [...new Set(symbols.filter((symbol) => SYMBOL_RE.test(symbol)))];
  const chunks: string[][] = [];
  for (let i = 0; i < unique.length; i += 12) chunks.push(unique.slice(i, i + 12));

  const rows: Record<string, ReturnType<typeof toQuote>> = {};
  await Promise.all(
    chunks.map(async (chunk) => {
      const url = new URL(QUOTE_URL);
      url.searchParams.set("symbols", chunk.join("|"));
      url.searchParams.set("requestMethod", "itv");
      url.searchParams.set("noform", "1");
      url.searchParams.set("partnerId", "2");
      url.searchParams.set("fund", "1");
      url.searchParams.set("output", "json");

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": UA,
        },
      });
      if (!response.ok) {
        throw new Error("quote_upstream");
      }
      const data = (await response.json()) as {
        FormattedQuoteResult?: { FormattedQuote?: CnbcQuote | CnbcQuote[] };
      };
      const list = data.FormattedQuoteResult?.FormattedQuote;
      const quotes = Array.isArray(list) ? list : list ? [list] : [];
      for (const quote of quotes) {
        if (!quote.symbol || Number(quote.code) !== 0) continue;
        rows[quote.symbol] = toQuote(quote);
      }
    }),
  );
  return rows;
}

function toQuote(quote: CnbcQuote) {
  return {
    symbol: quote.symbol,
    price: parseNumber(quote.last),
    change: parseNumber(quote.change),
    changePct: parseNumber(quote.change_pct),
    open: parseNumber(quote.open),
    high: parseNumber(quote.high),
    low: parseNumber(quote.low),
    previousClose: parseNumber(quote.previous_day_closing),
    yearHigh: parseNumber(quote.yrhiprice),
    yearLow: parseNumber(quote.yrloprice),
    currency: quote.currencyCode ?? "",
    asOf: quote.last_time ?? null,
    marketStatus: quote.curmktstatus ?? null,
    shortName: quote.shortName ?? quote.name ?? "",
  };
}

async function fetchChart(symbol: string, range: string) {
  const { start, end, bar } = rangeWindow(range);
  const url = `${CHART_URL}/${encodeURIComponent(symbol)}/${bar}/${start}/${end}/adjusted/EST5EDT.json`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": UA,
    },
  });
  if (!response.ok) {
    throw new Error("chart_upstream");
  }
  const data = (await response.json()) as {
    barData?: { priceBars?: PriceBar[] };
  };
  const bars = data.barData?.priceBars ?? [];
  return bars
    .map((barItem) => ({
      time: barItem.tradeTimeinMills ?? 0,
      open: parseNumber(barItem.open),
      high: parseNumber(barItem.high),
      low: parseNumber(barItem.low),
      close: parseNumber(barItem.close),
      volume: typeof barItem.volume === "number" ? barItem.volume : 0,
    }))
    .filter((point) => point.time > 0 && point.close != null);
}

interface ApiRequest {
  url?: string;
  method?: string;
}

function attach(server: ViteDevServer | PreviewServer) {
  server.middlewares.use(async (req, res, next) => {
    const request = req as ApiRequest;
    if (!request.url?.startsWith("/api/")) {
      next();
      return;
    }

    try {
      const url = readUrl(request, "127.0.0.1");
      if (request.method === "GET" && url.pathname === "/api/health") {
        json(res, 200, { ok: true });
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/quotes") {
        const symbols = url.searchParams.get("symbols")?.split(",") ?? [];
        if (symbols.length === 0 || symbols.length > 80) {
          json(res, 400, { error: "invalid_symbols" });
          return;
        }
        const quotes = await fetchQuotes(symbols);
        json(res, 200, { quotes });
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/chart") {
        const symbol = url.searchParams.get("symbol") ?? "";
        const range = url.searchParams.get("range") ?? "1mo";
        if (!SYMBOL_RE.test(symbol) || !ALLOWED_RANGE.has(range)) {
          json(res, 400, { error: "invalid_chart_query" });
          return;
        }
        const points = await fetchChart(symbol, range);
        json(res, 200, { symbol, range, points });
        return;
      }

      json(res, 404, { error: "not_found" });
    } catch {
      json(res, 502, { error: "upstream_unavailable" });
    }
  });
}

export function marketApiPlugin(): Plugin {
  return {
    name: "local-market-api",
    configureServer(server) {
      attach(server);
    },
    configurePreviewServer(server) {
      attach(server);
    },
  };
}
