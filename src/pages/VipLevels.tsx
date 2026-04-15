import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Gem } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useFetchUser } from '../hooks/useFetchUser';
import { useAuthStore } from '../store/useAuthStore';

interface VipLevelCardProps {
  levelId: number;
  level: string;
  range: string;
  benefits: {
    percentNormal: string;
    percentPremium: string;
    maxOrders: string;
  };
  isCurrent?: boolean;
  color: string;
}

const VipLevelCard: React.FC<VipLevelCardProps> = ({ level, range, benefits, isCurrent, color }) => {
  const { t } = useTranslation();
  const iconColorClass = useMemo(() => {
    if (color.includes('orange')) return 'text-orange-500';
    if (color.includes('cyan')) return 'text-cyan-500';
    if (color.includes('blue')) return 'text-blue-700';
    if (color.includes('purple')) return 'text-purple-600';
    if (color.includes('yellow')) return 'text-yellow-600';
    return 'text-black';
  }, [color]);

  return (
    <div className="bg-[#F5F5F5] rounded-3xl p-6 mb-4 relative overflow-hidden border border-gray-100 shadow-sm">
      <div className="flex items-center gap-4">
        {/* VIP Icon */}
        <div className={`relative w-18 h-18 flex items-center justify-center flex-shrink-0`}>
          <div className={`absolute inset-0 ${color} opacity-20 rounded-2xl transform rotate-45`}></div>
          <div className={`relative z-10 flex flex-col items-center justify-center`}>
            <Gem className={`w-10 h-10 ${iconColorClass}`} />
            <span className={`text-[10px] font-black ${iconColorClass} mt-0.5`}>{level}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-2xl font-black tracking-tight">{level}</h3>
            {isCurrent && (
              <span className="bg-black text-white text-[10px] font-bold px-3 py-1 rounded-full">
                {t('vip.current')}
              </span>
            )}
          </div>
          
          <p className="text-[#FF7A7A] font-bold text-lg mb-4">{range}</p>
          
          <ul className="space-y-2">
            <li className="text-sm font-medium text-gray-800 flex items-start gap-2">
              <span className="mt-1.5 w-1 h-1 bg-black rounded-full flex-shrink-0"></span>
              {t('vip.benefit1', { percent: benefits.percentNormal })}
            </li>
            <li className="text-sm font-medium text-gray-800 flex items-start gap-2">
              <span className="mt-1.5 w-1 h-1 bg-black rounded-full flex-shrink-0"></span>
              {t('vip.benefit2', { percent: benefits.percentPremium })}
            </li>
            <li className="text-sm font-medium text-gray-800 flex items-start gap-2">
              <span className="mt-1.5 w-1 h-1 bg-black rounded-full flex-shrink-0"></span>
              {t('vip.benefit3', { count: benefits.maxOrders })}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

interface VipApiItem {
  level_id: number;
  level_name: string;
  dannum: number;
  qd_rate: number;
  co_rate: number;
  color: string;
  img: string;
  money: string;
}

export default function VipLevels() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useFetchUser();
  const currency = useAuthStore((state) => state.currency) || 'USD';
  const [vipData, setVipData] = useState<(VipLevelCardProps & { isCurrent?: boolean })[]>([]);
  const [loading, setLoading] = useState(true);

  const formatMoney = (value: string | number) => {
    const num = Number(value || 0);
    if (Number.isNaN(num)) return '0.00';
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  useEffect(() => {
    const fetchVipList = async () => {
      setLoading(true);
      try {
        const res = await api.post('/index/vipList', '', {
          headers: {
            Lang: i18n.language || 'en',
          },
        });
        const list: VipApiItem[] = Array.isArray(res?.data) ? res.data : [];

        const mapped = list.map((item, index) => {
          const currentMoney = Number(item.money || 0);
          const prevMoney = index > 0 ? Number(list[index - 1]?.money || 0) : 0;
          const isLast = index === list.length - 1;
          const range = isLast
            ? `${formatMoney(currentMoney)} ${currency} ${t('vip.orAbove')}`
            : `${formatMoney(prevMoney)} - ${formatMoney(currentMoney)} ${currency}`;

          return {
            levelId: Number(item.level_id) || 0,
            level: item.level_name || `VIP${item.level_id}`,
            range,
            benefits: {
              percentNormal: String((Number(item.qd_rate || 0) / 1000).toFixed(1)),
              percentPremium: String((Number(item.co_rate || 0) / 1000).toFixed(1)),
              maxOrders: String(item.dannum || 0),
            },
            isCurrent: Number(user?.level_id) === Number(item.level_id),
            color: item.color || 'bg-gray-400',
          };
        });

        setVipData(mapped);
      } catch (error) {
        setVipData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVipList();
  }, [t, i18n.language, user?.level_id, currency]);

  return (
    <div className="min-h-screen bg-white pb-12">
      <Header />
      
      <main className="px-6 pt-6">
        {/* Sub Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">{t('vip.title')}</h1>
          <div className="w-10"></div>
        </div>

        {/* VIP Cards List */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-center text-gray-400 py-10">{t('history.loading')}</p>
          ) : vipData.length === 0 ? (
            <p className="text-center text-gray-400 py-10">{t('history.noMoreData')}</p>
          ) : vipData.map((vip, index) => (
            <VipLevelCard 
              key={index} 
              levelId={vip.levelId}
              level={vip.level}
              range={vip.range}
              benefits={vip.benefits}
              isCurrent={vip.isCurrent}
              color={vip.color}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
