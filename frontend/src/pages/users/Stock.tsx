import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import type { StockProps } from '../../interface/stock';
import { useLocation } from 'react-router-dom';
import type { StockDetailType } from '../../interface/stock';
import { GrSearch } from 'react-icons/gr';
import { MdClear } from 'react-icons/md';
import { motion } from 'framer-motion';

export default function Stock() {
  const [stocks, setStocks] = useState<StockProps[]>([]);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const navigate = useNavigate();

  const lastStockRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore],
  );

  useEffect(() => {
    const fetchStocks = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `/stock?page=${page}&limit=10${query ? `&search=${encodeURIComponent(query)}` : ''}`,
        );
        const newData: StockProps[] = res.data.data;

        setStocks((prev) => (query && page === 1 ? newData : [...prev, ...newData]));
        setHasMore(newData.length > 0);
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, [page, query]);

  const handleClickStock = useCallback(
    (id: number) => {
      navigate(`/user/stock-detail?id=${id}`);
    },
    [navigate],
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-5">
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-light text-slate-900 mb-2 tracking-tight"
          >
            ภาพรวมตลาด
          </motion.h1>
          {stocks.length > 0 && stocks[0]?.updatedAt && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xs text-slate-400 font-light"
            >
              อัปเดตล่าสุด: {new Date(stocks[0].updatedAt).toLocaleString('th-TH')}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative max-w-xl mt-5"
          >
            <div className="flex items-center h-14 rounded-2xl bg-white shadow-sm border border-slate-200/60 transition-all duration-300 hover:shadow-md focus-within:border-slate-300 focus-within:shadow-md">
              <motion.button
                onClick={() => {
                  setIsSearching(true);
                  setTimeout(() => setIsSearching(false), 700);
                  searchInputRef.current?.focus();
                }}
                whileTap={{ scale: 0.95 }}
                animate={{ rotate: isSearching ? 360 : 0 }}
                transition={{ duration: 0.7, ease: 'easeInOut' }}
                className={`h-14 flex items-center justify-center px-5 transition-colors ${
                  query || isSearchFocused ? 'text-slate-700' : 'text-slate-400'
                }`}
                aria-label="Search"
              >
                <GrSearch size={20} />
              </motion.button>

              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder="ค้นหาหุ้น เช่น CPALL, BTS..."
                className="flex-1 text-slate-900 placeholder-slate-400 focus:outline-none text-base font-light pr-12"
              />

              {query && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => {
                    setQuery('');
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                  aria-label="Clear search"
                >
                  <MdClear size={20} />
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>

        <div className="space-y-3">
          {useMemo(() => {
            const filtered = stocks.filter((s) => {
              if (!query) return true;
              const q = query.toLowerCase();
              return (
                String(s.symbol).toLowerCase().includes(q) ||
                String(s.name ?? '')
                  .toLowerCase()
                  .includes(q)
              );
            });
            return filtered.map((s, i) => {
              const isLast = i === filtered.length - 1;
              const isPositive = s.regularMarketChangePercent && s.regularMarketChangePercent >= 0;

              return (
                <motion.div
                  ref={isLast ? lastStockRef : null}
                  key={`${s.id}-${i}`}
                  onClick={() => handleClickStock(s.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ y: -2, scale: 1.005 }}
                  whileTap={{ scale: 0.995 }}
                  className="bg-white rounded-2xl hover:shadow-lg transition-all cursor-pointer p-6 border border-slate-200/60 shadow-sm group"
                >
                  <div className="grid grid-cols-[2fr_1fr_auto] gap-6 items-center">
                    <div className="min-w-0">
                      <h3 className="text-xl font-medium text-slate-900 truncate tracking-tight group-hover:text-slate-700 transition-colors">
                        {s.symbol}
                      </h3>
                      {s.name && (
                        <p className="text-sm text-slate-500 truncate mt-1 font-light">{s.name}</p>
                      )}
                    </div>

                    <div className="text-left">
                      <p className="text-2xl font-light text-slate-900 tabular-nums">
                        {s.regularMarketPrice?.toFixed(2) ?? '-'}
                      </p>
                    </div>

                    <div
                      className={`text-right font-medium text-lg tabular-nums px-4 py-2 rounded-xl ${
                        isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {s.regularMarketChangePercent
                        ? `${s.regularMarketChangePercent >= 0 ? '+' : ''}${s.regularMarketChangePercent.toFixed(2)}%`
                        : '-'}
                    </div>
                  </div>
                </motion.div>
              );
            });
          }, [stocks, query, handleClickStock, lastStockRef])}
        </div>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-slate-600"></div>
            <p className="text-slate-500 mt-4 text-sm font-light">กำลังโหลด...</p>
          </motion.div>
        )}

        {!loading && stocks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-slate-400 font-light">ไม่พบข้อมูลหุ้น</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export const StockDetail: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const idParam = params.get('id');
  const [stock, setStock] = useState<StockDetailType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!idParam) return;
    const fetchStock = async () => {
      setLoading(true);
      try {
        const id = Number(idParam);
        if (isNaN(id)) return;
        const res = await axios.get(`/stock/${id}`);
        setStock(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStock();
  }, [idParam]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-slate-200 border-t-slate-600"></div>
          <p className="text-slate-500 mt-5 font-light">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400 font-light">ไม่พบข้อมูลหุ้น</p>
      </div>
    );
  }

  const isPositive = stock.regularMarketChangePercent && stock.regularMarketChangePercent >= 0;

  const StatRow = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex justify-between py-4 border-b border-slate-100/80 last:border-0 group">
      <span className="text-slate-600 text-sm font-light">{label}</span>
      <span className="font-medium text-slate-900 tabular-nums group-hover:text-slate-700 transition-colors">
        {value}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-10 mb-8 shadow-xl border border-slate-700/50"
        >
          <h1 className="text-5xl font-light text-white mb-3 tracking-tight">{stock.symbol}</h1>
          {stock.name && <p className="text-slate-300 mb-8 font-light text-lg">{stock.name}</p>}

          <div className="flex flex-wrap justify-between items-end gap-6">
            <span className="text-6xl font-light text-white tabular-nums">
              ${stock.regularMarketPrice?.toFixed(2) ?? '-'}
            </span>
            <span
              className={`text-lg font-medium px-5 py-2.5 rounded-2xl tabular-nums ${
                isPositive
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              {stock.regularMarketChange?.toFixed(2) ?? '-'} (
              {stock.regularMarketChangePercent?.toFixed(2) ?? '-'}%)
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/60 p-8 mb-4 shadow-sm"
        >
          <h2 className="font-medium text-slate-900 mb-6 text-lg tracking-tight">วันนี้</h2>
          <StatRow label="เปิด" value={`$${stock.regularMarketOpen?.toFixed(2) ?? '-'}`} />
          <StatRow label="สูงสุด" value={`$${stock.regularMarketHigh?.toFixed(2) ?? '-'}`} />
          <StatRow label="ต่ำสุด" value={`$${stock.regularMarketLow?.toFixed(2) ?? '-'}`} />
          <StatRow label="ปิดก่อนหน้า" value={`$${stock.previousClose?.toFixed(2) ?? '-'}`} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/60 p-8 mb-4 shadow-sm"
        >
          <h2 className="font-medium text-slate-900 mb-6 text-lg tracking-tight">ปริมาณ</h2>
          <StatRow label="Volume" value={stock.volume?.toLocaleString() ?? '-'} />
          <StatRow label="Avg Volume" value={stock.averageVolume?.toLocaleString() ?? '-'} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/60 p-8 mb-4 shadow-sm"
        >
          <h2 className="font-medium text-slate-900 mb-6 text-lg tracking-tight">ค่าเฉลี่ย</h2>
          <StatRow label="50 วัน" value={`$${stock.fiftyDayAverage?.toFixed(2) ?? '-'}`} />
          <StatRow label="200 วัน" value={`$${stock.twoHundredDayAverage?.toFixed(2) ?? '-'}`} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/60 p-8 shadow-sm"
        >
          <h2 className="font-medium text-slate-900 mb-6 text-lg tracking-tight">
            ช่วง 52 สัปดาห์
          </h2>
          <StatRow label="ต่ำสุด" value={`$${stock.fiftyTwoWeekLow?.toFixed(2) ?? '-'}`} />
          <StatRow label="สูงสุด" value={`$${stock.fiftyTwoWeekHigh?.toFixed(2) ?? '-'}`} />
          {stock.fiftyTwoWeekChangePercent !== undefined && (
            <StatRow label="เปลี่ยนแปลง" value={`${stock.fiftyTwoWeekChangePercent.toFixed(2)}%`} />
          )}
        </motion.div>

        {stock.lastUpdated && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-xs text-slate-400 mt-8 font-light"
          >
            อัปเดตล่าสุด: {new Date(stock.lastUpdated).toLocaleString('th-TH')}
          </motion.p>
        )}
      </div>
    </div>
  );
};
