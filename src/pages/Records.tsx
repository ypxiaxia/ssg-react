import { useCallback, useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

interface OrderRecord {
  id: number;
  create_time: string;
  goods_name: string;
  pic: string;
  total: string;
  gray: string;
  status: number;
  currency?: string;
}

const STATUS_MAP: Record<string, number> = {
  All: 0,
  Pending: 1,
  Ack: 2,
  Completed: 3,
};
const PAGE_SIZE = 10;

export default function Records() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('All');
  const [records, setRecords] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [processingOrderId, setProcessingOrderId] = useState<number | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const fetchingRef = useRef(false);

  const TABS = [
    { key: 'All', label: t('records.tabs.all') },
    { key: 'Pending', label: t('records.tabs.pending') },
    { key: 'Ack', label: t('records.tabs.ack') },
    { key: 'Completed', label: t('records.tabs.completed') },
  ];

  const fetchRecords = useCallback(async (targetPage: number, append: boolean) => {
    const data = new URLSearchParams();
    data.append('status', String(STATUS_MAP[activeTab] ?? 0));
    data.append('page', String(targetPage));
    data.append('size', String(PAGE_SIZE));

    try {
      fetchingRef.current = true;
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      const res = await api.post('/order/index', data);
      const list = Array.isArray(res?.data) ? res.data : [];

      setRecords((prev) => {
        if (!append) return list;
        const merged = [...prev, ...list];
        return merged.filter((item, index, arr) => arr.findIndex((x) => x.id === item.id) === index);
      });
      setHasMore(list.length === PAGE_SIZE);
    } catch (error) {
      if (!append) {
        setRecords([]);
      }
      setHasMore(false);
    } finally {
      fetchingRef.current = false;
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeTab]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchRecords(1, false);
  }, [activeTab, fetchRecords]);

  useEffect(() => {
    if (page === 1) return;
    fetchRecords(page, true);
  }, [page, fetchRecords]);

  useEffect(() => {
    if (!hasMore || loading || loadingMore || !loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting) return;
        if (fetchingRef.current) return;
        setPage((prev) => prev + 1);
      },
      { rootMargin: '120px' }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, records.length]);

  const getStatusText = (status: number) => {
    if (status === 3) return t('records.tabs.completed');
    if (status === 2) return t('records.tabs.ack');
    return t('records.tabs.pending');
  };

  const getStatusClassName = (status: number) => {
    if (status === 3) return 'bg-green-50 text-green-600';
    if (status === 2) return 'bg-blue-50 text-blue-600';
    return 'bg-orange-50 text-orange-600';
  };

  const handlePendingConfirm = async (orderId: number) => {
    if (processingOrderId) return;
    const data = new URLSearchParams();
    data.append('order_id', String(orderId));

    try {
      setProcessingOrderId(orderId);
      await api.post('/good/topay', data);

      setRecords((prev) => {
        if (activeTab === 'Pending') {
          return prev.filter((item) => item.id !== orderId);
        }
        return prev.map((item) => (item.id === orderId ? { ...item, status: 2 } : item));
      });
    } catch (error) {
      // Error modal is handled by api interceptor.
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleAckComplete = async (orderId: number) => {
    if (processingOrderId) return;
    const data = new URLSearchParams();
    data.append('order_id', String(orderId));

    try {
      setProcessingOrderId(orderId);
      await api.post('/good/repurchase', data);

      setRecords((prev) => {
        if (activeTab === 'Ack') {
          return prev.filter((item) => item.id !== orderId);
        }
        return prev.map((item) => (item.id === orderId ? { ...item, status: 3 } : item));
      });
    } catch (error) {
      // Error modal is handled by api interceptor.
    } finally {
      setProcessingOrderId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      <Header />
      
      <main className="px-6 pt-6">
        <h1 className="text-3xl font-bold mb-6">{t('records.title')}</h1>

        {/* Tabs */}
        <div className="flex items-center justify-between mb-8 border-b border-gray-100">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 px-2 text-sm font-bold transition-all relative ${
                activeTab === tab.key ? 'text-black' : 'text-gray-400'
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
                />
              )}
            </button>
          ))}
        </div>

        {/* Records List */}
        <div className="space-y-6">
          {loading && (
            <div className="py-20 text-center">
              <p className="text-gray-400 font-medium">{t('common.submit')}...</p>
            </div>
          )}

          {!loading && records.map((record) => (
            <div key={record.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-medium text-gray-400">{record.create_time}</span>
                {record.status === 1 ? (
                  <button
                    type="button"
                    onClick={() => handlePendingConfirm(record.id)}
                    disabled={processingOrderId === record.id}
                    className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusClassName(record.status)} disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {processingOrderId === record.id ? `${t('common.submit')}...` : t('records.tabs.pending')}
                  </button>
                ) : record.status === 2 ? (
                  <button
                    type="button"
                    onClick={() => handleAckComplete(record.id)}
                    disabled={processingOrderId === record.id}
                    className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusClassName(record.status)} disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {processingOrderId === record.id ? `${t('common.submit')}...` : t('records.tabs.ack')}
                  </button>
                ) : (
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusClassName(record.status)}`}>
                    {getStatusText(record.status)}
                  </span>
                )}
              </div>

              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                  <img 
                    src={record.pic} 
                    alt={record.goods_name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold mb-3 line-clamp-2">{record.goods_name}</h4>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium uppercase mb-0.5">{t('records.totalAmount')}</p>
                      <p className="text-sm font-bold">{record.total} {record.currency || 'USDT'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-medium uppercase mb-0.5">{t('records.profit')}</p>
                      <p className="text-sm font-bold text-[#D1B18D]">{record.gray} {record.currency || 'USDT'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {!loading && records.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-gray-400 font-medium">{t('records.noRecords')}</p>
            </div>
          )}

          {!loading && records.length > 0 && (
            <div ref={loadMoreRef} className="py-6 text-center">
              {loadingMore ? (
                <p className="text-gray-400 text-sm font-medium">{t('common.submit')}...</p>
              ) : !hasMore ? (
                <p className="text-gray-300 text-xs font-medium">{t('history.noMoreData')}</p>
              ) : null}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
