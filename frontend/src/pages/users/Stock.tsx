import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import type { StockProps } from '../../types/stock';
import { useLocation } from 'react-router-dom';
import type { StockDetailType } from '../../types/stock';
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
    <div className="min-h-screen p-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">ภาพรวมหุ้น</h1>

          <div className="relative max-w-md">
            <div className="flex items-center h-11 rounded-lg bg-white border border-gray-200 transition-all duration-200 hover:border-gray-400 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100">
              <motion.button
                onClick={() => {
                  setIsSearching(true);
                  setTimeout(() => setIsSearching(false), 700);
                  searchInputRef.current?.focus();
                }}
                whileTap={{ scale: 0.95 }}
                animate={{ rotate: isSearching ? 360 : 0 }}
                transition={{ duration: 0.7, ease: 'easeInOut' }}
                className={`h-11 flex items-center justify-center px-3 transition-colors ${
                  query || isSearchFocused ? 'text-blue-600' : 'text-gray-400'
                }`}
                aria-label="Search"
              >
                <GrSearch size={18} />
              </motion.button>

              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder="ค้นหาหุ้น เช่น AAPL, TSLA"
                className="pr-10 text-gray-900 placeholder-gray-400 focus:outline-none"
              />

              {query && (
                <button
                  onClick={() => {
                    setQuery('');
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Clear search"
                >
                  <MdClear size={18} />
                </button>
              )}
            </div>
          </div>

          {stocks.length > 0 && stocks[0]?.updatedAt && (
            <p className="text-xs text-gray-400 mt-3">
              อัปเดตล่าสุด: {new Date(stocks[0].updatedAt).toLocaleString('th-TH')}
            </p>
          )}
        </div>

        <div className="space-y-2">
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
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.99 }}
                  className="bg-white rounded-lg hover:bg-gray-50 transition-all cursor-pointer p-5 border border-gray-100 hover:border-gray-200"
                >
                  <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 items-center">
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{s.symbol}</h3>
                      {s.name && <p className="text-sm text-gray-500 truncate mt-0.5">{s.name}</p>}
                    </div>

                    <div className="text-left">
                      <p className="text-lg font-semibold text-gray-900">
                        ${s.regularMarketPrice?.toFixed(2) ?? '-'}
                      </p>
                    </div>

                    <div
                      className={`text-right font-semibold text-base ${
                        isPositive ? 'text-green-600' : 'text-red-600'
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
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-blue-600"></div>
            <p className="text-gray-500 mt-3 text-sm">กำลังโหลด...</p>
          </div>
        )}

        {!loading && stocks.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500">ไม่พบข้อมูลหุ้น</p>
          </div>
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-blue-600"></div>
          <p className="text-gray-500 mt-4">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">ไม่พบข้อมูลหุ้น</p>
      </div>
    );
  }

  const isPositive = stock.regularMarketChangePercent && stock.regularMarketChangePercent >= 0;

  const StatRow = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-gray-600 text-sm">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );

  return (
    <div className="min-h-screen p-6 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="bg-blue-500 rounded-xl p-8 mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">{stock.symbol}</h1>
          {stock.name && <p className="text-blue-100 mb-6">{stock.name}</p>}

          <div className="flex justify-between items-center gap-4">
            <span className="text-5xl font-bold text-white">
              ${stock.regularMarketPrice?.toFixed(2) ?? '-'}
            </span>
            <span
              className={`text-lg font-semibold px-3 py-1 rounded-lg ${
                isPositive ? 'bg-green-600 text-white' : 'bg-red-500 text-white'
              }`}
            >
              {stock.regularMarketChange?.toFixed(2) ?? '-'} (
              {stock.regularMarketChangePercent?.toFixed(2) ?? '-'}%)
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 className="font-semibold text-gray-900 mb-4">วันนี้</h2>
          <StatRow label="เปิด" value={`$${stock.regularMarketOpen?.toFixed(2) ?? '-'}`} />
          <StatRow label="สูงสุด" value={`$${stock.regularMarketHigh?.toFixed(2) ?? '-'}`} />
          <StatRow label="ต่ำสุด" value={`$${stock.regularMarketLow?.toFixed(2) ?? '-'}`} />
          <StatRow label="ปิดก่อนหน้า" value={`$${stock.previousClose?.toFixed(2) ?? '-'}`} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 className="font-semibold text-gray-900 mb-4">ปริมาณ</h2>
          <StatRow label="Volume" value={stock.volume?.toLocaleString() ?? '-'} />
          <StatRow label="Avg Volume" value={stock.averageVolume?.toLocaleString() ?? '-'} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 className="font-semibold text-gray-900 mb-4">ค่าเฉลี่ย</h2>
          <StatRow label="50 วัน" value={`$${stock.fiftyDayAverage?.toFixed(2) ?? '-'}`} />
          <StatRow label="200 วัน" value={`$${stock.twoHundredDayAverage?.toFixed(2) ?? '-'}`} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">ช่วง 52 สัปดาห์</h2>
          <StatRow label="ต่ำสุด" value={`$${stock.fiftyTwoWeekLow?.toFixed(2) ?? '-'}`} />
          <StatRow label="สูงสุด" value={`$${stock.fiftyTwoWeekHigh?.toFixed(2) ?? '-'}`} />
          {stock.fiftyTwoWeekChangePercent !== undefined && (
            <StatRow label="เปลี่ยนแปลง" value={`${stock.fiftyTwoWeekChangePercent.toFixed(2)}%`} />
          )}
        </div>

        {stock.lastUpdated && (
          <p className="text-center text-xs text-gray-400 mt-6">
            อัปเดตล่าสุด: {new Date(stock.lastUpdated).toLocaleString('th-TH')}
          </p>
        )}
      </div>
    </div>
  );
};
