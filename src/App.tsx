import { useEffect, useMemo, useState } from "react";
import { fetchChart, fetchQuotes, type ChartPoint, type Quote } from "./api";
import { DetailChart } from "./components/DetailChart";
import { Sparkline } from "./components/Sparkline";
import { CATALOG, CATEGORIES, CATALOG_BY_ID, TAPE_IDS, type Category } from "./data/catalog";
import { changeTone, formatChange, formatClock, formatDateTime, formatPercent, formatPrice } from "./lib/format";
import { formatZonedTime, isSessionOpen, SESSIONS, sessionStatusLabel } from "./lib/sessions";

type CategoryId = Category | "all";

export function App() {
  const [now, setNow] = useState(() => new Date());
  const [category, setCategory] = useState<CategoryId>("all");
  const [query, setQuery] = useState("");
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [sparks, setSparks] = useState<Record<string, ChartPoint[]>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [range, setRange] = useState("1mo");
  const [detailPoints, setDetailPoints] = useState<ChartPoint[]>([]);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selected = selectedId ? CATALOG_BY_ID[selectedId] : null;

  const visible = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return CATALOG.filter((item) => {
      if (!keyword && category !== "all" && item.category !== category) return false;
      if (!keyword) return true;
      return [item.name, item.nameEn, item.country, item.symbol].some((field) => field.toLowerCase().includes(keyword));
    });
  }, [category, query]);

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: CATALOG.length };
    for (const item of CATALOG) {
      result[item.category] = (result[item.category] ?? 0) + 1;
    }
    return result;
  }, []);

  const stats = useMemo(() => {
    let up = 0;
    let down = 0;
    let flat = 0;
    for (const item of CATALOG) {
      const tone = changeTone(quotes[item.symbol]?.changePct ?? null);
      if (tone === "up") up += 1;
      else if (tone === "down") down += 1;
      else flat += 1;
    }
    return { up, down, flat, open: SESSIONS.filter((session) => isSessionOpen(session.id, now)).length };
  }, [now, quotes]);

  async function loadQuotes() {
    setError(null);
    try {
      const data = await fetchQuotes(CATALOG.map((item) => item.symbol));
      setQuotes(data);
      setUpdatedAt(new Date());
    } catch {
      setError("公开行情暂时无法获取，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const clock = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(clock);
  }, []);

  useEffect(() => {
    void loadQuotes();
    const timer = window.setInterval(() => {
      void loadQuotes();
    }, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const symbols = visible.slice(0, 16).map((item) => item.symbol);
    void (async () => {
      const entries = await Promise.all(
        symbols.map(async (symbol) => {
          try {
            return [symbol, await fetchChart(symbol, "1mo")] as const;
          } catch {
            return [symbol, []] as const;
          }
        }),
      );
      if (cancelled) return;
      setSparks((current) => ({ ...current, ...Object.fromEntries(entries) }));
    })();
    return () => {
      cancelled = true;
    };
  }, [visible]);

  useEffect(() => {
    if (!selected) {
      setDetailPoints([]);
      return;
    }
    let cancelled = false;
    void fetchChart(selected.symbol, range)
      .then((points) => {
        if (!cancelled) setDetailPoints(points);
      })
      .catch(() => {
        if (!cancelled) setDetailPoints([]);
      });
    return () => {
      cancelled = true;
    };
  }, [range, selected]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="mark" aria-hidden="true">指</div>
          <div>
            <h1>全球指数查看器</h1>
            <p>本地运行 · 仅公开行情 · 不采集个人信息</p>
          </div>
        </div>
        <label className="search">
          <span>搜</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="按名称、地区或代码筛选，检索只在本地完成"
          />
        </label>
        <div className="top-actions">
          <span className="privacy-pill">127.0.0.1 本机访问</span>
          <span>{formatClock(now)}</span>
          <span>{updatedAt ? `更新 ${formatClock(updatedAt)}` : "尚未更新"}</span>
          <button className="refresh" onClick={() => void loadQuotes()}>刷新</button>
        </div>
      </header>

      <div className="tape" aria-label="主要指数滚动条">
        {TAPE_IDS.map((id) => {
          const item = CATALOG_BY_ID[id];
          const quote = quotes[item.symbol];
          const tone = changeTone(quote?.changePct ?? null);
          return (
            <button key={id} className="tape-item" onClick={() => setSelectedId(id)}>
              <span>{item.name}</span>
              <b>{formatPrice(quote?.price ?? null, item.kind)}</b>
              <span className={`tone-${tone}`}>{formatPercent(quote?.changePct ?? null)}</span>
            </button>
          );
        })}
      </div>

      <div className={`layout${selected ? " with-detail" : ""}`}>
        <aside className="sidebar">
          {CATEGORIES.map((entry) => (
            <button
              key={entry.id}
              className={`nav-btn${category === entry.id ? " active" : ""}`}
              onClick={() => setCategory(entry.id)}
            >
              <span>{entry.label}</span>
              <span>{counts[entry.id] ?? 0}</span>
            </button>
          ))}

          <div className="sessions">
            <h3>主要市场时段</h3>
            {SESSIONS.map((session) => {
              const open = isSessionOpen(session.id, now);
              return (
                <div className="session-row" key={session.id}>
                  <span>{session.label} {formatZonedTime(session.timeZone, now)}</span>
                  <span className={open ? "open" : "closed"}>{open ? "开盘" : "收盘"}</span>
                </div>
              );
            })}
          </div>

          <div className="note">
            <h3>隐私说明</h3>
            不注册、不登录、不跟踪。检索只过滤本地列表，行情请求由本机转发公开数据，不上传身份或账户信息。
          </div>
        </aside>

        <main className="main">
          <section className="stats">
            <div className="stat"><span>上涨</span><strong className="tone-up">{stats.up}</strong></div>
            <div className="stat"><span>下跌</span><strong className="tone-down">{stats.down}</strong></div>
            <div className="stat"><span>平盘/无数据</span><strong>{stats.flat}</strong></div>
            <div className="stat"><span>主要市场开盘</span><strong>{stats.open}/{SESSIONS.length}</strong></div>
          </section>

          {error && <div className="error">{error}</div>}
          {loading && <div className="loading">正在获取公开行情…</div>}
          {!loading && visible.length === 0 && <div className="empty">没有匹配的指数</div>}

          <section className="grid">
            {visible.map((item) => {
              const quote = quotes[item.symbol];
              const tone = changeTone(quote?.changePct ?? null);
              return (
                <button
                  key={item.id}
                  className={`card${selectedId === item.id ? " selected" : ""}`}
                  onClick={() => setSelectedId(item.id)}
                >
                  <div className="card-top">
                    <div>
                      <small>{item.flag} {item.country}</small>
                      <h2>{item.name}</h2>
                    </div>
                    <span className="badge">{sessionStatusLabel(item.session, now)}</span>
                  </div>
                  <div className="price">{formatPrice(quote?.price ?? null, item.kind)}</div>
                  <div className="card-mid">
                    <span className={`chg ${tone}`}>
                      {formatChange(quote?.change ?? null, item.kind)} {formatPercent(quote?.changePct ?? null)}
                    </span>
                    <Sparkline points={sparks[item.symbol] ?? []} tone={tone} />
                  </div>
                </button>
              );
            })}
          </section>
        </main>

        {selected && (
          <aside className="detail">
            <div className="detail-head">
              <div>
                <small className="meta">{selected.flag} {selected.country} · {selected.nameEn}</small>
                <h2>{selected.name}</h2>
                <div className="price">{formatPrice(quotes[selected.symbol]?.price ?? null, selected.kind)}</div>
                <span className={`chg ${changeTone(quotes[selected.symbol]?.changePct ?? null)}`}>
                  {formatPercent(quotes[selected.symbol]?.changePct ?? null)}
                </span>
              </div>
              <button className="icon-btn" onClick={() => setSelectedId(null)} aria-label="关闭详情">×</button>
            </div>

            <div className="ranges">
              {["1d", "5d", "1mo", "6mo", "1y", "5y"].map((item) => (
                <button key={item} className={range === item ? "active" : ""} onClick={() => setRange(item)}>
                  {item}
                </button>
              ))}
            </div>

            <div className="chart-wrap">
              <DetailChart points={detailPoints} item={selected} />
            </div>

            <div className="metrics">
              <div><span>开盘</span><b>{formatPrice(quotes[selected.symbol]?.open ?? null, selected.kind)}</b></div>
              <div><span>前收</span><b>{formatPrice(quotes[selected.symbol]?.previousClose ?? null, selected.kind)}</b></div>
              <div><span>最高</span><b>{formatPrice(quotes[selected.symbol]?.high ?? null, selected.kind)}</b></div>
              <div><span>最低</span><b>{formatPrice(quotes[selected.symbol]?.low ?? null, selected.kind)}</b></div>
              <div><span>52周高</span><b>{formatPrice(quotes[selected.symbol]?.yearHigh ?? null, selected.kind)}</b></div>
              <div><span>52周低</span><b>{formatPrice(quotes[selected.symbol]?.yearLow ?? null, selected.kind)}</b></div>
              <div><span>行情时间</span><b>{formatDateTime(quotes[selected.symbol]?.asOf ?? null)}</b></div>
              <div><span>交易时段</span><b>{sessionStatusLabel(selected.session, now)}</b></div>
            </div>
            <p className="disclaimer">
              数据来自公开市场行情，可能存在延迟，仅供浏览，不构成投资建议。本应用不处理任何个人账户、持仓或身份信息。
            </p>
          </aside>
        )}
      </div>
    </div>
  );
}
