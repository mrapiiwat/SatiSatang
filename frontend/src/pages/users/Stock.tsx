import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import type { StockProps } from '../../types/stock';
import { useLocation } from 'react-router-dom';
import type { StockDetailType } from '../../types/stock';

export default function Stock() {
  const [stocks, setStocks] = useState<StockProps[]>([]);
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
        const res = await axios.get(`/stock?page=${page}&limit=10`);
        const newData: StockProps[] = res.data.data;
        setStocks((prev) => [...prev, ...newData]);
        setHasMore(newData.length > 0);
      } finally {
        setLoading(false);
      }
    };
    fetchStocks();
  }, [page]);

  const handleClickStock = (id: number) => {
    navigate(`/user/stock-detail?id=${id}`);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Stock Overview</h1>
          {stocks.length > 0 && stocks[0]?.updatedAt && (
            <p className="text-sm text-gray-500">
              Latest update: {new Date(stocks[0].updatedAt).toLocaleString('th-TH')}
            </p>
          )}
        </div>

        <div className="space-y-3">
          {stocks.map((s, i) => {
            const isLast = i === stocks.length - 1;
            const isPositive = s.regularMarketChangePercent && s.regularMarketChangePercent >= 0;

            return (
              <div
                ref={isLast ? lastStockRef : null}
                key={`${s.id}-${i}`}
                onClick={() => handleClickStock(s.id)}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer p-5 border border-black-200"
              >
                <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 items-center">
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 truncate">{s.symbol}</h3>
                    {s.name && <p className="text-sm text-gray-500 truncate mt-0.5">{s.name}</p>}
                  </div>

                  <div className="text-left truncate">
                    <p className="text-xl font-bold text-gray-900">
                      ${s.regularMarketPrice?.toFixed(2) ?? '-'}
                    </p>
                  </div>

                  <div
                    className={`text-right font-bold text-lg truncate ${isPositive ? 'text-green-600' : 'text-red-600'
                      }`}
                  >
                    {s.regularMarketChangePercent
                      ? `${s.regularMarketChangePercent >= 0 ? '+' : ''}${s.regularMarketChangePercent.toFixed(2)}%`
                      : '-'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {loading && <p className="text-center py-8 text-gray-600">กำลังโหลด...</p>}

        {!loading && stocks.length === 0 && (
          <p className="text-center py-16 text-gray-600">ไม่พบข้อมูลหุ้น</p>
        )}
      </div>
    </div>
  );
};

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
        <p className="text-gray-600">กำลังโหลด...</p>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">ไม่พบข้อมูลหุ้น</p>
      </div>
    );
  }

  const isPositive = stock.regularMarketChangePercent && stock.regularMarketChangePercent >= 0;

  const StatRow = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{stock.symbol}</h1>
          {stock.name && <p className="text-gray-600 mb-4">{stock.name}</p>}

          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-gray-900">
              {stock.regularMarketPrice?.toFixed(2) ?? '-'}
            </span>
            <span
              className={`text-lg font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}
            >
              {stock.regularMarketChange?.toFixed(2) ?? '-'}(
              {stock.regularMarketChangePercent?.toFixed(2) ?? '-'}%)
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h2 className="font-semibold text-gray-900 mb-4">วันนี้</h2>
          <StatRow label="เปิด" value={stock.regularMarketOpen?.toFixed(2) ?? '-'} />
          <StatRow label="สูงสุด" value={stock.regularMarketHigh?.toFixed(2) ?? '-'} />
          <StatRow label="ต่ำสุด" value={stock.regularMarketLow?.toFixed(2) ?? '-'} />
          <StatRow label="ปิดก่อนหน้า" value={stock.previousClose?.toFixed(2) ?? '-'} />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h2 className="font-semibold text-gray-900 mb-4">ปริมาณ</h2>
          <StatRow label="Volume" value={stock.volume ?? '-'} />
          <StatRow label="Avg Volume" value={stock.averageVolume ?? '-'} />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h2 className="font-semibold text-gray-900 mb-4">ค่าเฉลี่ย</h2>
          <StatRow label="50 วัน" value={stock.fiftyDayAverage?.toFixed(2) ?? '-'} />
          <StatRow label="200 วัน" value={stock.twoHundredDayAverage?.toFixed(2) ?? '-'} />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">ช่วง 52 สัปดาห์</h2>
          <StatRow label="ต่ำสุด" value={stock.fiftyTwoWeekLow?.toFixed(2) ?? '-'} />
          <StatRow label="สูงสุด" value={stock.fiftyTwoWeekHigh?.toFixed(2) ?? '-'} />
          {stock.fiftyTwoWeekChangePercent !== undefined && (
            <StatRow label="เปลี่ยนแปลง" value={`${stock.fiftyTwoWeekChangePercent.toFixed(2)}%`} />
          )}
        </div>

        {stock.lastUpdated && (
          <p className="text-center text-sm text-gray-500 mt-6">
            อัพเดท: {new Date(stock.lastUpdated).toLocaleString('th-TH')}
          </p>
        )}
      </div>
    </div>
  );
};




