export interface StockDetailType {
  id: number;
  symbol: string;
  name?: string;
  quoteType?: string;
  currency?: string;
  market?: string;
  regularMarketPrice?: number;
  regularMarketOpen?: number;
  regularMarketHigh?: number;
  regularMarketLow?: number;
  previousClose?: number;
  dayHigh?: number;
  dayLow?: number;
  volume?: string;
  averageVolume?: string;
  fiftyDayAverage?: number;
  twoHundredDayAverage?: number;
  fiftyTwoWeekLow?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekChangePercent?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  marketState?: string;
  tradeable?: boolean;
  lastUpdated?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StockProps {
  id: number;
  symbol: string;
  name?: string;
  regularMarketPrice?: number;
  regularMarketChangePercent?: number;
  updatedAt?: string;
}
