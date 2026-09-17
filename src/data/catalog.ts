export type Category =
  | "americas"
  | "europe"
  | "apac"
  | "commodities"
  | "rates"
  | "crypto";

export type SessionId =
  | "newyork"
  | "toronto"
  | "saopaulo"
  | "mexicocity"
  | "buenosaires"
  | "london"
  | "europe"
  | "tokyo"
  | "shanghai"
  | "hongkong"
  | "seoul"
  | "taipei"
  | "sydney"
  | "mumbai"
  | "singapore"
  | "kualalumpur"
  | "auckland"
  | "bangkok"
  | "futures"
  | "crypto";

export interface IndexItem {
  id: string;
  symbol: string;
  name: string;
  nameEn: string;
  country: string;
  flag: string;
  category: Category;
  session: SessionId;
  kind: "index" | "yield" | "crypto" | "commodity" | "fx";
}

export const CATEGORIES: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "americas", label: "美洲" },
  { id: "europe", label: "欧洲" },
  { id: "apac", label: "亚太" },
  { id: "commodities", label: "大宗商品" },
  { id: "rates", label: "利率汇率" },
  { id: "crypto", label: "加密资产" },
];

export const CATALOG: IndexItem[] = [
  { id: "spx", symbol: ".SPX", name: "标普500", nameEn: "S&P 500", country: "美国", flag: "🇺🇸", category: "americas", session: "newyork", kind: "index" },
  { id: "dji", symbol: ".DJI", name: "道琼斯工业", nameEn: "Dow Jones", country: "美国", flag: "🇺🇸", category: "americas", session: "newyork", kind: "index" },
  { id: "ixic", symbol: ".IXIC", name: "纳斯达克综合", nameEn: "NASDAQ", country: "美国", flag: "🇺🇸", category: "americas", session: "newyork", kind: "index" },
  { id: "rut", symbol: ".RUT", name: "罗素2000", nameEn: "Russell 2000", country: "美国", flag: "🇺🇸", category: "americas", session: "newyork", kind: "index" },
  { id: "vix", symbol: ".VIX", name: "VIX 恐慌指数", nameEn: "VIX", country: "美国", flag: "🇺🇸", category: "americas", session: "newyork", kind: "index" },
  { id: "tsx", symbol: ".GSPTSE", name: "加拿大TSX", nameEn: "TSX Composite", country: "加拿大", flag: "🇨🇦", category: "americas", session: "toronto", kind: "index" },
  { id: "bvsp", symbol: ".BVSP", name: "巴西BOVESPA", nameEn: "Bovespa", country: "巴西", flag: "🇧🇷", category: "americas", session: "saopaulo", kind: "index" },
  { id: "mxx", symbol: ".MXX", name: "墨西哥IPC", nameEn: "S&P/BMV IPC", country: "墨西哥", flag: "🇲🇽", category: "americas", session: "mexicocity", kind: "index" },
  { id: "merv", symbol: ".MERV", name: "阿根廷MERVAL", nameEn: "Merval", country: "阿根廷", flag: "🇦🇷", category: "americas", session: "buenosaires", kind: "index" },

  { id: "ftse", symbol: ".FTSE", name: "英国富时100", nameEn: "FTSE 100", country: "英国", flag: "🇬🇧", category: "europe", session: "london", kind: "index" },
  { id: "dax", symbol: ".GDAXI", name: "德国DAX", nameEn: "DAX", country: "德国", flag: "🇩🇪", category: "europe", session: "europe", kind: "index" },
  { id: "cac", symbol: ".FCHI", name: "法国CAC40", nameEn: "CAC 40", country: "法国", flag: "🇫🇷", category: "europe", session: "europe", kind: "index" },
  { id: "stoxx", symbol: ".STOXX50", name: "欧洲斯托克50", nameEn: "Euro Stoxx 50", country: "欧元区", flag: "🇪🇺", category: "europe", session: "europe", kind: "index" },
  { id: "smi", symbol: ".SSMI", name: "瑞士SMI", nameEn: "SMI", country: "瑞士", flag: "🇨🇭", category: "europe", session: "europe", kind: "index" },
  { id: "aex", symbol: ".AEX", name: "荷兰AEX", nameEn: "AEX", country: "荷兰", flag: "🇳🇱", category: "europe", session: "europe", kind: "index" },
  { id: "ibex", symbol: ".IBEX", name: "西班牙IBEX35", nameEn: "IBEX 35", country: "西班牙", flag: "🇪🇸", category: "europe", session: "europe", kind: "index" },
  { id: "mib", symbol: ".FTMIB", name: "意大利FTSE MIB", nameEn: "FTSE MIB", country: "意大利", flag: "🇮🇹", category: "europe", session: "europe", kind: "index" },
  { id: "omx", symbol: ".OMXS30", name: "瑞典OMX30", nameEn: "OMX Stockholm 30", country: "瑞典", flag: "🇸🇪", category: "europe", session: "europe", kind: "index" },

  { id: "ssec", symbol: ".SSEC", name: "上证综指", nameEn: "Shanghai Composite", country: "中国", flag: "🇨🇳", category: "apac", session: "shanghai", kind: "index" },
  { id: "szi", symbol: ".SZI", name: "深证成指", nameEn: "Shenzhen Component", country: "中国", flag: "🇨🇳", category: "apac", session: "shanghai", kind: "index" },
  { id: "a50", symbol: ".FTXIN9", name: "富时中国A50", nameEn: "FTSE China A50", country: "中国", flag: "🇨🇳", category: "apac", session: "shanghai", kind: "index" },
  { id: "hsi", symbol: ".HSI", name: "恒生指数", nameEn: "Hang Seng", country: "中国香港", flag: "🇭🇰", category: "apac", session: "hongkong", kind: "index" },
  { id: "hsce", symbol: ".HSCE", name: "恒生国企", nameEn: "HSCEI", country: "中国香港", flag: "🇭🇰", category: "apac", session: "hongkong", kind: "index" },
  { id: "hstech", symbol: ".HSTECH", name: "恒生科技", nameEn: "Hang Seng Tech", country: "中国香港", flag: "🇭🇰", category: "apac", session: "hongkong", kind: "index" },
  { id: "n225", symbol: ".N225", name: "日经225", nameEn: "Nikkei 225", country: "日本", flag: "🇯🇵", category: "apac", session: "tokyo", kind: "index" },
  { id: "kospi", symbol: ".KS11", name: "韩国KOSPI", nameEn: "KOSPI", country: "韩国", flag: "🇰🇷", category: "apac", session: "seoul", kind: "index" },
  { id: "twii", symbol: ".TWII", name: "台湾加权", nameEn: "TAIEX", country: "中国台湾", flag: "🇹🇼", category: "apac", session: "taipei", kind: "index" },
  { id: "axjo", symbol: ".AXJO", name: "澳洲ASX200", nameEn: "ASX 200", country: "澳大利亚", flag: "🇦🇺", category: "apac", session: "sydney", kind: "index" },
  { id: "nsei", symbol: ".NSEI", name: "印度Nifty50", nameEn: "Nifty 50", country: "印度", flag: "🇮🇳", category: "apac", session: "mumbai", kind: "index" },
  { id: "sti", symbol: ".STI", name: "新加坡海峡时报", nameEn: "Straits Times", country: "新加坡", flag: "🇸🇬", category: "apac", session: "singapore", kind: "index" },
  { id: "klse", symbol: ".KLSE", name: "马来西亚KLCI", nameEn: "FTSE Bursa KLCI", country: "马来西亚", flag: "🇲🇾", category: "apac", session: "kualalumpur", kind: "index" },
  { id: "nz50", symbol: ".NZ50", name: "新西兰NZX50", nameEn: "NZX 50", country: "新西兰", flag: "🇳🇿", category: "apac", session: "auckland", kind: "index" },
  { id: "seti", symbol: ".SETI", name: "泰国SET", nameEn: "SET Index", country: "泰国", flag: "🇹🇭", category: "apac", session: "bangkok", kind: "index" },

  { id: "gold", symbol: "@GC.1", name: "黄金期货", nameEn: "Gold", country: "全球", flag: "🟨", category: "commodities", session: "futures", kind: "commodity" },
  { id: "silver", symbol: "@SI.1", name: "白银期货", nameEn: "Silver", country: "全球", flag: "⬜", category: "commodities", session: "futures", kind: "commodity" },
  { id: "wti", symbol: "@CL.1", name: "WTI原油", nameEn: "WTI Crude", country: "全球", flag: "🛢️", category: "commodities", session: "futures", kind: "commodity" },
  { id: "brent", symbol: "@BZ.1", name: "布伦特原油", nameEn: "Brent Crude", country: "全球", flag: "🛢️", category: "commodities", session: "futures", kind: "commodity" },
  { id: "ng", symbol: "@NG.1", name: "天然气", nameEn: "Natural Gas", country: "全球", flag: "🔥", category: "commodities", session: "futures", kind: "commodity" },
  { id: "copper", symbol: "@HG.1", name: "铜期货", nameEn: "Copper", country: "全球", flag: "🟧", category: "commodities", session: "futures", kind: "commodity" },

  { id: "dxy", symbol: ".DXY", name: "美元指数", nameEn: "US Dollar Index", country: "美国", flag: "🇺🇸", category: "rates", session: "futures", kind: "fx" },
  { id: "us10y", symbol: "US10Y", name: "美国十年期国债", nameEn: "US 10-Year", country: "美国", flag: "🇺🇸", category: "rates", session: "newyork", kind: "yield" },
  { id: "us2y", symbol: "US2Y", name: "美国两年期国债", nameEn: "US 2-Year", country: "美国", flag: "🇺🇸", category: "rates", session: "newyork", kind: "yield" },

  { id: "btc", symbol: "BTC.CM=", name: "比特币", nameEn: "Bitcoin", country: "全球", flag: "₿", category: "crypto", session: "crypto", kind: "crypto" },
  { id: "eth", symbol: "ETH.CM=", name: "以太坊", nameEn: "Ethereum", country: "全球", flag: "Ξ", category: "crypto", session: "crypto", kind: "crypto" },
];

export const TAPE_IDS = ["spx", "dji", "ixic", "n225", "hsi", "ssec", "ftse", "dax", "dxy", "gold", "vix", "btc"];

export const CATALOG_BY_ID = Object.fromEntries(CATALOG.map((item) => [item.id, item]));
export const CATALOG_BY_SYMBOL = Object.fromEntries(CATALOG.map((item) => [item.symbol, item]));
