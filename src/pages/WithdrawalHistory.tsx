import React, { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import qs from 'qs';

interface CashItem {
  id: number;
  order_id: string;
  money: string;
  create_time: string;
  bank_name: string;
  bank_number: string;
  status_str: string;
  remark: string;
}

export default function WithdrawalHistory() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('All');
  const [records, setRecords] = useState<CashItem[]>([]);
  const [loading, setLoading] = useState(false);

  const TABS = [
    { key: 'All', label: t('history.all') },
    { key: 'Reviewing', label: t('history.reviewing') },
    { key: 'Success', label: t('history.success') },
    { key: 'Reject', label: t('history.reject') },
  ];

  const getStatusByTab = (tab: string) => {
    if (tab === 'Reviewing') return 1;
    if (tab === 'Success') return 2;
    if (tab === 'Reject') return 3;
    return 0;
  };

  useEffect(() => {
    const fetchWithdrawalHistory = async () => {
      setLoading(true);
      try {
        const status = getStatusByTab(activeTab);
        const data = qs.stringify({
          status,
          page: 1,
          size: 10,
        });
        const res = await api.post('/account/cash_list', data);
        setRecords(Array.isArray(res?.data) ? res.data : []);
      } catch (error) {
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWithdrawalHistory();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-white pb-12">
      <Header />
      
      <main className="px-6 pt-6">
        {/* Sub Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">{t('history.title')}</h1>
          <div className="w-10"></div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-3 mb-12">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab.key 
                  ? 'bg-black text-white shadow-md' 
                  : 'bg-gray-200 text-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <p className="text-gray-400 font-medium">{t('history.loading')}</p>
          </div>
        ) : records.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-400 font-medium">{t('history.noMoreData')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-2xl p-4 shadow-sm">
                <div className="space-y-2 text-sm">
                  <p><span className="font-bold">{t('history.orderId')}：</span>{item.order_id}</p>
                  <p><span className="font-bold">{t('history.money')}：</span>{item.money}</p>
                  <p><span className="font-bold">{t('history.createTime')}：</span>{item.create_time}</p>
                  <p><span className="font-bold">{t('history.walletType')}：</span>{item.bank_name || '-'}</p>
                  <p><span className="font-bold">{t('history.walletAddress')}：</span>{item.bank_number || '-'}</p>
                  <p><span className="font-bold">{t('history.statusDesc')}：</span>{item.status_str || '-'}</p>
                  <p><span className="font-bold">{t('history.remark')}：</span>{item.remark || '-'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
