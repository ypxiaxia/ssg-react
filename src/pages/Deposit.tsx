import React, { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useFetchUser } from '../hooks/useFetchUser';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { openKefuSelector } from '../utils/support';

interface RechargeItem {
  id: number;
  order_id: string;
  money: string;
  create_time: string;
  status: number;
}

interface FundItem {
  id: number;
  order_id: number | string;
  remarks: string;
  money: string;
  user_money: string;
  type: number;
  create_time: number | string;
}

export default function Deposit() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const now = new Date();
  const [activeTab, setActiveTab] = useState<'Recharge' | 'Fund'>('Recharge');
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));
  const [selectedMonthNum, setSelectedMonthNum] = useState(String(now.getMonth() + 1).padStart(2, '0'));
  const [rechargeList, setRechargeList] = useState<RechargeItem[]>([]);
  const [fundList, setFundList] = useState<FundItem[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [rechargePage, setRechargePage] = useState(1);
  const [fundPage, setFundPage] = useState(1);
  const [hasMoreRecharge, setHasMoreRecharge] = useState(true);
  const [hasMoreFund, setHasMoreFund] = useState(true);
  const { user } = useFetchUser();
  const kefu = useAuthStore((state) => state.kefu);
  const currency = useAuthStore((state) => state.currency) || 'USD';
  const selectedMonth = `${selectedYear}-${selectedMonthNum}`;
  const PAGE_SIZE = 10;
  const yearOptions = Array.from({ length: 6 }, (_, index) => String(now.getFullYear() - index));
  const monthOptions = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0'));

  const formatCurrency = (value: any) => {
    const num = parseFloat(value || 0);
    return num.toFixed(2);
  };

  const availableBalance = formatCurrency(user?.user_money);
  const totalBalance = formatCurrency(user?.user_money);
  const handleContactSupport = async () => {
    await openKefuSelector(kefu, 'Dazze Customer Service');
  };

  const getRechargeStatusText = (status: number) => {
    if (status === 1) return t('deposit.status.pending');
    if (status === 2) return t('deposit.status.recharged');
    return '-';
  };

  const getFundTypeText = (type: number) => {
    if (type === 1) return t('deposit.fundType.commission');
    if (type === 2) return t('deposit.fundType.recharge');
    if (type === 3) return t('deposit.fundType.pay');
    if (type === 4) return t('deposit.fundType.commissionReturn');
    if (type === 7) return t('deposit.fundType.withdraw');
    if (type === 8) return t('deposit.fundType.withdrawFailed');
    return '-';
  };

  const formatFundNumber = (value: number | string) => {
    const num = Number(value || 0);
    if (Number.isNaN(num)) return '0.0000';
    return num.toFixed(4);
  };

  const formatFundTime = (value: number | string) => {
    const timestamp = Number(value);
    if (!Number.isNaN(timestamp) && timestamp > 0) {
      const date = new Date(timestamp * 1000);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const hh = String(date.getHours()).padStart(2, '0');
      const mm = String(date.getMinutes()).padStart(2, '0');
      const ss = String(date.getSeconds()).padStart(2, '0');
      return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
    }
    return String(value || '-');
  };

  const fetchRechargeRecords = async (page: number, append: boolean) => {
    const res = await api.post(`/account/recharge_list?page=${page}&size=${PAGE_SIZE}&time=${selectedMonth}`);
    const list = Array.isArray(res?.data) ? res.data : [];
    setRechargeList((prev) => (append ? [...prev, ...list] : list));
    setRechargePage(page);
    setHasMoreRecharge(list.length >= PAGE_SIZE);
  };

  const fetchFundRecords = async (page: number, append: boolean) => {
    const res = await api.get(`/account/fund_record?page=${page}&size=${PAGE_SIZE}&time=${selectedMonth}`);
    const list = Array.isArray(res?.data) ? res.data : [];
    setFundList((prev) => (append ? [...prev, ...list] : list));
    setFundPage(page);
    setHasMoreFund(list.length >= PAGE_SIZE);
  };

  useEffect(() => {
    const fetchFirstPage = async () => {
      setLoadingRecords(true);
      setLoadingMore(false);
      try {
        if (activeTab === 'Recharge') {
          setRechargeList([]);
          setFundList([]);
          setRechargePage(1);
          setHasMoreRecharge(true);
          await fetchRechargeRecords(1, false);
        } else {
          setFundList([]);
          setRechargeList([]);
          setFundPage(1);
          setHasMoreFund(true);
          await fetchFundRecords(1, false);
        }
      } catch (error) {
        setRechargeList([]);
        setFundList([]);
        setHasMoreRecharge(false);
        setHasMoreFund(false);
      } finally {
        setLoadingRecords(false);
      }
    };

    fetchFirstPage();
  }, [activeTab, selectedMonth]);

  const handleLoadMore = useCallback(async () => {
    if (loadingRecords || loadingMore) return;

    if (activeTab === 'Recharge') {
      if (!hasMoreRecharge || rechargeList.length === 0) return;
      setLoadingMore(true);
      try {
        await fetchRechargeRecords(rechargePage + 1, true);
      } catch (error) {
        setHasMoreRecharge(false);
      } finally {
        setLoadingMore(false);
      }
      return;
    }

    if (!hasMoreFund || fundList.length === 0) return;
    setLoadingMore(true);
    try {
      await fetchFundRecords(fundPage + 1, true);
    } catch (error) {
      setHasMoreFund(false);
    } finally {
      setLoadingMore(false);
    }
  }, [activeTab, fundList.length, fundPage, hasMoreFund, hasMoreRecharge, loadingMore, loadingRecords, rechargeList.length, rechargePage, selectedMonth]);

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 320);
      const reachedBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 180;
      if (reachedBottom) {
        handleLoadMore();
      }
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [handleLoadMore]);

  return (
    <div className="min-h-screen bg-white pb-12">
      <Header />
      
      <main className="px-6 pt-6">
        {/* Sub Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">{t('deposit.title')}</h1>
          <div className="w-10"></div>
        </div>

        {/* Available Balance Card */}
        <div className="bg-black text-white rounded-3xl p-8 mb-4 relative overflow-hidden shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold mb-4">{t('deposit.availableBalance')}</h2>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{availableBalance}</span>
                <span className="text-sm font-bold opacity-80">{currency}</span>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleContactSupport}
              className="bg-[#D1B18D] text-black px-6 py-3 rounded-2xl font-black text-sm shadow-lg"
            >
              {t('deposit.topUp')}
            </motion.button>
          </div>
        </div>

        {/* Total Balance Card */}
        <div className="bg-black text-white rounded-3xl p-8 mb-10 relative overflow-hidden shadow-xl">
          <h2 className="text-xl font-bold text-[#D1B18D] mb-4">{t('deposit.totalBalance')}</h2>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{totalBalance}</span>
            <span className="text-sm font-bold opacity-80">{currency}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-3 mb-12">
          <button
            onClick={() => setActiveTab('Recharge')}
            className={`flex-1 py-3.5 rounded-xl text-sm font-black transition-all ${
              activeTab === 'Recharge' 
                ? 'bg-[#1A2332] text-white shadow-md' 
                : 'bg-gray-100 text-black'
            }`}
          >
            {t('deposit.rechargeRecord')}
          </button>
          <button
            onClick={() => setActiveTab('Fund')}
            className={`flex-1 py-3.5 rounded-xl text-sm font-black transition-all ${
              activeTab === 'Fund' 
                ? 'bg-[#1A2332] text-white shadow-md' 
                : 'bg-gray-100 text-black'
            }`}
          >
            {t('deposit.fundRecord')}
          </button>
        </div>

        <div className="mb-5">
          <label className="text-sm font-bold block mb-2">{t('deposit.month')}</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">{t('deposit.year')}</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">{t('deposit.monthWord')}</label>
              <select
                value={selectedMonthNum}
                onChange={(e) => setSelectedMonthNum(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium"
              >
                {monthOptions.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {activeTab === 'Recharge' ? (
          loadingRecords ? (
            <div className="py-20 text-center">
              <p className="text-gray-400 font-medium">{t('deposit.loading')}</p>
            </div>
          ) : rechargeList.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-gray-400 font-medium">{t('history.noMoreData')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rechargeList.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-2xl p-4 shadow-sm">
                  <div className="space-y-2 text-sm">
                    <p><span className="font-bold">{t('deposit.orderId')}：</span>{item.order_id}</p>
                    <p><span className="font-bold">{t('deposit.rechargeAmount')}：</span>{item.money}</p>
                    <p><span className="font-bold">{t('deposit.rechargeTime')}：</span>{item.create_time}</p>
                    <p><span className="font-bold">{t('deposit.statusLabel')}：</span>{getRechargeStatusText(item.status)}</p>
                  </div>
                </div>
              ))}
              {loadingMore && (
                <div className="py-4 text-center text-sm text-gray-400">{t('deposit.loading')}</div>
              )}
              {!loadingMore && !hasMoreRecharge && rechargeList.length > 0 && (
                <div className="py-2 text-center text-sm text-gray-400">{t('history.noMoreData')}</div>
              )}
            </div>
          )
        ) : (
          loadingRecords ? (
            <div className="py-20 text-center">
              <p className="text-gray-400 font-medium">{t('deposit.loading')}</p>
            </div>
          ) : fundList.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-gray-400 font-medium">{t('history.noMoreData')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {fundList.map((item) => {
                const beforeAmount = Number(item.user_money || 0);
                const changeAmount = Number(item.money || 0);
                const afterAmount = beforeAmount - changeAmount;

                return (
                  <div key={item.id} className="border border-gray-200 rounded-2xl p-4 shadow-sm">
                    <div className="space-y-2 text-sm">
                      <p><span className="font-bold">{t('deposit.fundTypeLabel')}：</span>{getFundTypeText(item.type)}</p>
                      <p><span className="font-bold">{t('deposit.changeAmount')}：</span>{formatFundNumber(changeAmount)}</p>
                      <p><span className="font-bold">{t('deposit.beforeAmount')}：</span>{formatFundNumber(beforeAmount)}</p>
                      <p><span className="font-bold">{t('deposit.afterAmount')}：</span>{formatFundNumber(afterAmount)}</p>
                      <p><span className="font-bold">{t('deposit.fundTime')}：</span>{formatFundTime(item.create_time)}</p>
                    </div>
                  </div>
                );
              })}
              {loadingMore && (
                <div className="py-4 text-center text-sm text-gray-400">{t('deposit.loading')}</div>
              )}
              {!loadingMore && !hasMoreFund && fundList.length > 0 && (
                <div className="py-2 text-center text-sm text-gray-400">{t('history.noMoreData')}</div>
              )}
            </div>
          )
        )}
      </main>

      {showBackToTop && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleBackToTop}
          className="fixed right-5 bottom-6 z-40 bg-black text-white rounded-full px-4 py-3 shadow-xl flex items-center gap-1"
        >
          <ChevronUp className="w-4 h-4" />
          <span className="text-xs font-bold">{t('deposit.backToTop')}</span>
        </motion.button>
      )}
    </div>
  );
}
