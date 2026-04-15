import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { Star, Rocket, Landmark, Clock, Gem } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { getVipBadgeBgClass } from '../vipTheme';
import { useAuthStore } from '../store/useAuthStore';

interface ProductItem {
  id: number;
  name: string;
  price: string;
  image: string;
  rating: number;
}

interface StartingInfo {
  userName: string;
  levelId: number;
  userMoney: string | number;
  todayCommission: string | number;
  freezeMoney: string | number;
  completed: number;
  total: number;
}

export default function Starting() {
  const { t } = useTranslation();
  const currency = useAuthStore((state) => state.currency) || 'USD';
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [startingInfo, setStartingInfo] = useState<StartingInfo>({
    userName: '...',
    levelId: 1,
    userMoney: 0,
    todayCommission: 0,
    freezeMoney: 0,
    completed: 0,
    total: 0,
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [grabbing, setGrabbing] = useState(false);
  const [grabbedOrder, setGrabbedOrder] = useState<any | null>(null);
  const [confirmingOrder, setConfirmingOrder] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/good/index');
        const info = res?.data || {};
        const goods = Array.isArray(info.goods) ? info.goods : [];
        const mapped: ProductItem[] = goods.map((item: any) => ({
          id: Number(item.goods_id),
          name: item.goods_name || '',
          price: item.retail_price || '0.00',
          image: item.pic || '',
          rating: Number(item.star_rating || 0),
        }));
        setProducts(mapped);
        setStartingInfo({
          userName: info.user_name || '...',
          levelId: Number(info.level_id) || 1,
          userMoney: info.user_money || 0,
          todayCommission: info.today_yj ?? info.yj ?? 0,
          freezeMoney: info.freeze_money ?? 0,
          completed: Number(info.completed) || 0,
          total: Number(info.total) || 0,
        });
      } catch (error) {
        setProducts([]);
        setStartingInfo((prev) => ({
          ...prev,
          userName: '...',
        }));
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (showModal || products.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [showModal, products.length]);

  const currentProduct = products[currentIndex];
  const vipBadgeBgClass = getVipBadgeBgClass(startingInfo.levelId);

  const formatCurrency = (value: any) => {
    const num = parseFloat(value || 0);
    return num.toFixed(2);
  };

  const formatAmountWithPrefix = (value: any) => {
    const raw = String(value ?? '0');
    const matched = raw.match(/^([^0-9-]*)(-?\d+(?:\.\d+)?)/);
    if (!matched) return formatCurrency(raw);
    const prefix = matched[1] || '';
    const amount = parseFloat(matched[2]);
    if (Number.isNaN(amount)) return `${prefix}0.00`;
    return `${prefix}${amount.toFixed(2)}`;
  };

  const handleStart = async () => {
    try {
      setGrabbing(true);
      const res = await api.get('/good/grab');
      if (res?.data) {
        setGrabbedOrder(res.data);
        setShowModal(true);
      }
    } catch (error) {
      // Error modal is handled by api interceptor.
    } finally {
      setGrabbing(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!grabbedOrder?.id || confirmingOrder) return;
    const data = new URLSearchParams();
    data.append('order_id', String(grabbedOrder.id));

    try {
      setConfirmingOrder(true);
      await api.post('/good/topay', data);
      await api.post('/good/repurchase', data);
      const refreshed = await api.get('/good/index');
      const info = refreshed?.data || {};
      const goods = Array.isArray(info.goods) ? info.goods : [];
      const mapped: ProductItem[] = goods.map((item: any) => ({
        id: Number(item.goods_id),
        name: item.goods_name || '',
        price: item.retail_price || '0.00',
        image: item.pic || '',
        rating: Number(item.star_rating || 0),
      }));
      setProducts(mapped);
      setStartingInfo({
        userName: info.user_name || '...',
        levelId: Number(info.level_id) || 1,
        userMoney: info.user_money || 0,
        todayCommission: info.today_yj ?? info.yj ?? 0,
        freezeMoney: info.freeze_money ?? 0,
        completed: Number(info.completed) || 0,
        total: Number(info.total) || 0,
      });
      setShowModal(false);
    } catch (error) {
      // Error modal is handled by api interceptor.
    } finally {
      setConfirmingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      <Header />
      
      <main className="px-6 pt-6">
        {/* Marquee Notification Bar */}
        <div className="bg-gray-100 rounded-xl px-4 py-2 mb-6 flex items-center gap-3 overflow-hidden">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Rocket className="w-4 h-4 text-[#D1B18D]" />
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <motion.div
              animate={{ x: [300, -600] }}
              transition={{ 
                repeat: Infinity, 
                duration: 15, 
                ease: "linear" 
              }}
              className="whitespace-nowrap text-sm font-bold text-gray-800"
            >
              {t('starting.marqueeText', 'Welcome to Dazze! Start your journey now and earn commissions with every order. New VIP levels are now available!')}
            </motion.div>
          </div>
        </div>

        {/* User Info */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-gray-500 font-medium">{t('starting.hello')}</p>
            <h2 className="text-3xl font-bold">{startingInfo.userName}</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">VIP{startingInfo.levelId}</span>
            <div className={`w-10 h-10 ${vipBadgeBgClass} rounded-lg flex items-center justify-center`}>
              <Gem className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Product Carousel Area */}
        <div className="relative flex items-center justify-center mb-6 overflow-hidden py-4">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.8, x: 100 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -100 }}
              transition={{ duration: 0.5 }}
              className="w-64 h-64 bg-gray-100 rounded-3xl p-6 shadow-sm z-10"
            >
              <img 
                src={currentProduct?.image} 
                alt={currentProduct?.name || 'product'} 
                className="w-full h-full object-contain rounded-2xl"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </AnimatePresence>
          
          {/* Decorative Previews */}
          <div className="absolute -left-16 w-32 h-40 bg-gray-100 rounded-xl opacity-30 blur-[1px]"></div>
          <div className="absolute -right-16 w-32 h-40 bg-gray-100 rounded-xl opacity-30 blur-[1px]"></div>
        </div>

        {/* Product Details */}
        <div className="text-center mb-8 h-32">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h3 className="text-xl font-bold mb-1">{currentProduct?.name}</h3>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < (currentProduct?.rating || 0) ? 'fill-orange-300 text-orange-300' : 'text-gray-200'}`} 
                  />
                ))}
                <span className="text-sm font-bold text-orange-300 ml-1">{currentProduct?.rating || 0}</span>
              </div>
              <p className="text-xl font-bold">Price: {formatCurrency(currentProduct?.price)} {currency}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Start Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleStart}
          disabled={grabbing}
          className="w-full py-5 bg-[#D1B18D] text-white rounded-xl font-bold text-2xl mb-8 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {grabbing ? t('starting.grabbing') : t('starting.startNow', { completed: startingInfo.completed, total: startingInfo.total })}
        </motion.button>

        {/* Product Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowModal(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh]"
              >
                <div className="overflow-y-auto p-6 sm:p-8 custom-scrollbar">
                  <h2 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6 text-center uppercase tracking-tight">
                    {grabbedOrder?.order_sn || t('starting.modal.title')}
                  </h2>
                  
                  <div className="w-full aspect-square bg-gray-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4 sm:mb-6">
                    <img 
                      src={grabbedOrder?.pic || currentProduct?.image} 
                      alt={grabbedOrder?.goods_name || currentProduct?.name || 'product'} 
                      className="w-full h-full object-contain rounded-xl sm:rounded-2xl"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="space-y-2 mb-6 sm:mb-8 text-center">
                    <h3 className="text-lg sm:text-xl font-bold">{grabbedOrder?.goods_name || currentProduct?.name}</h3>
                    <p className="text-xl sm:text-2xl font-black text-black pt-2">
                      {t('starting.modal.price')}: {formatAmountWithPrefix(grabbedOrder?.price || currentProduct?.price || 0)}
                    </p>
                    <p className="text-lg sm:text-xl font-bold text-[#D1B18D]">
                      {t('starting.modal.commission')}: {formatAmountWithPrefix(grabbedOrder?.gray || 0)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleConfirmOrder}
                      disabled={confirmingOrder}
                      className="w-full py-3 sm:py-4 bg-black text-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {confirmingOrder ? `${t('common.submit')}...` : t('starting.modal.confirm')}
                    </motion.button>
                    <button 
                      disabled={confirmingOrder}
                      onClick={() => setShowModal(false)}
                      className="w-full py-2 text-gray-400 font-bold text-xs sm:text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {t('starting.modal.cancel')}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Dashboard Card */}
        <div className="bg-black text-white rounded-[40px] p-8 space-y-8">
          {/* Today's Commission */}
          <div className="text-center">
            <Rocket className="w-12 h-12 mx-auto mb-4" />
            <p className="text-sm font-bold uppercase tracking-wider mb-1">{t('starting.todayCommission')}</p>
            <p className="text-3xl font-bold mb-2">{formatCurrency(startingInfo.todayCommission)} {currency}</p>
            <p className="text-[10px] text-gray-400">{t('starting.commissionDesc')}</p>
          </div>

          <div className="h-[1px] bg-gray-800 w-full"></div>

          {/* Balance and Hold Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center space-y-2">
              <Landmark className="w-10 h-10 mx-auto" />
              <p className="text-xs font-bold uppercase">{t('starting.balance')}</p>
              <p className="text-lg font-bold">{formatCurrency(startingInfo.userMoney)} {currency}</p>
              <p className="text-[8px] text-gray-400 leading-tight">{t('starting.balanceDesc')}</p>
            </div>
            <div className="text-center space-y-2">
              <Clock className="w-10 h-10 mx-auto" />
              <p className="text-xs font-bold uppercase">{t('starting.holdAmount')}</p>
              <p className="text-lg font-bold">{formatCurrency(startingInfo.freezeMoney)} {currency}</p>
              <p className="text-[8px] text-gray-400 leading-tight">{t('starting.holdDesc')}</p>
            </div>
          </div>

          <div className="h-[1px] bg-gray-800 w-full"></div>

          {/* Special Lucky Bonus */}
          <div className="text-center">
            <p className="text-sm font-bold mb-1">{t('starting.luckyBonus')}</p>
            <p className="text-xl font-bold">0.00 {currency}</p>
          </div>

          <div className="h-[1px] bg-gray-800 w-full"></div>

          {/* Important Notice */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-bold">{t('starting.importantNotice')}</h4>
            </div>
            <p className="text-xs font-bold">{t('starting.supportHours')}</p>
            <p className="text-xs font-bold">{t('starting.supportAssistance')}</p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
