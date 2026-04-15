import React from 'react';
import { ChevronLeft, Camera, Copy, User, Wallet, ArrowDownCircle, ArrowUpCircle, Bell, Globe, ChevronDown, LogOut, Gem } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';
import { getVipBadgeBgClass } from '../vipTheme';
import { useAuthStore } from '../store/useAuthStore';

interface ProfileMenuItemProps {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
}

function ProfileMenuItem({ icon: Icon, label, onClick }: ProfileMenuItemProps) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between px-6 py-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-4">
        <Icon className="w-6 h-6 text-black" />
        <span className="font-bold text-lg">{label}</span>
      </div>
      <ChevronDown className="w-6 h-6 text-gray-400" />
    </button>
  );
}

import { useFetchUser } from '../hooks/useFetchUser';

export default function Profile() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useFetchUser();
  const currency = useAuthStore((state) => state.currency) || 'USD';
  const vipBadgeBgClass = getVipBadgeBgClass(user?.level_id);

  const defaultAvatar = "https://picsum.photos/seed/avatar/300/300";

  const handleCopyReferral = async () => {
    if (user?.invite_code) {
      await navigator.clipboard.writeText(user.invite_code);
      Swal.fire({
        text: t('profile.copySuccess'),
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          popup: 'rounded-[1.5rem]',
        },
      });
    }
  };

  const formatCurrency = (value: any) => {
    const num = parseFloat(value || 0);
    return num.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      <Header />
      
      <main className="px-6 pt-6 mb-12">
        {/* Sub Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">{t('profile.title')}</h1>
          <div className="w-10"></div> {/* Spacer */}
        </div>

        {/* Profile Avatar */}
        <div className="flex flex-col items-center mb-10">
          <button 
            onClick={() => navigate('/account-info')}
            className="relative w-32 h-32 mb-4 group"
          >
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:opacity-80 transition-opacity">
              <img 
                src={user?.avatar || defaultAvatar} 
                alt="Avatar" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full shadow-md">
              <Camera className="w-4 h-4" />
            </div>
          </button>
          <button 
            onClick={() => navigate('/account-info')}
            className="flex items-center gap-2 text-sm font-bold text-gray-800"
          >
            {t('profile.editImage')}
          </button>
        </div>

        {/* User Info Card */}
        <div className="bg-black text-white rounded-[32px] p-8 mb-10 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">{t('starting.hello')}</p>
              <h2 className="text-4xl font-bold mb-2">{user?.username || '...'}</h2>
              <div className="flex items-center gap-2 text-xs font-bold">
                <span>{t('profile.referralCode')}: {user?.invite_code || '...'}</span>
                <Copy 
                  className="w-4 h-4 cursor-pointer hover:text-gray-300 transition-colors" 
                  onClick={handleCopyReferral}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">VIP{user?.level_id || '1'}</span>
              <div className={`w-10 h-10 ${vipBadgeBgClass} rounded-lg flex items-center justify-center shadow-lg`}>
                <Gem className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Credit Score */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold">{t('profile.creditScore')}:</span>
              <span className="text-xs font-bold">{user?.reputation || 100}%</span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${user?.reputation || 100}%` }}
                className="h-full bg-[#D1B18D]"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 border-t border-gray-800 pt-6">
            <div className="text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                {t('profile.todayProfit')} ({currency})
              </p>
              <p className="text-2xl font-bold">{formatCurrency(user?.deposit)}</p>
            </div>
            <div className="text-center border-l border-gray-800">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                {t('profile.totalBalance')} ({currency})
              </p>
              <p className="text-2xl font-bold">{formatCurrency(user?.user_money)}</p>
            </div>
          </div>
        </div>

        {/* Menu Sections */}
        <div className="space-y-10">
          {/* My Profile Section */}
          <section>
            <h3 className="text-2xl font-bold mb-4">{t('profile.sections.myProfile')}</h3>
            <div className="space-y-4">
              <ProfileMenuItem 
                icon={User} 
                label={t('profile.sections.accountInfo')} 
                onClick={() => navigate('/account-info')}
              />
              <ProfileMenuItem 
                icon={Wallet} 
                label={t('profile.sections.bindWallet')} 
                onClick={() => navigate('/bind-wallet')}
              />
            </div>
          </section>

          {/* My Financial Section */}
          <section>
            <h3 className="text-2xl font-bold mb-4">{t('profile.sections.myFinancial')}</h3>
            <div className="space-y-4">
              <ProfileMenuItem 
                icon={ArrowDownCircle} 
                label={t('profile.sections.deposit')} 
                onClick={() => navigate('/deposit')}
              />
              <ProfileMenuItem 
                icon={ArrowUpCircle} 
                label={t('profile.sections.withdraw')} 
                onClick={() => navigate('/withdrawal')}
              />
            </div>
          </section>

          {/* Other Section */}
          <section>
            <h3 className="text-2xl font-bold mb-4">{t('profile.sections.other')}</h3>
            <div className="space-y-4">
              <ProfileMenuItem icon={Bell} label={t('profile.sections.notifications')} onClick={() => navigate('/notice')} />
              <ProfileMenuItem 
                icon={Globe} 
                label={t('profile.sections.changeLanguage')} 
                onClick={() => navigate('/change-language')}
              />
            </div>
          </section>
        </div>

        {/* Logout Button */}
        <div className="mt-12 mb-16">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/logout')}
            className="w-full py-5 bg-black text-white rounded-2xl font-bold text-2xl flex items-center justify-center gap-3 shadow-lg"
          >
            <LogOut className="w-6 h-6" />
            {t('common.logout')}
          </motion.button>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-gray-400 font-medium">
          {t('profile.copyright')}
        </p>
      </main>

      <BottomNav />
    </div>
  );
}

