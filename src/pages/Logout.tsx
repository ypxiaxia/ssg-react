import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/useAuthStore';
import logoutImage from '../assets/LogOut.png';

export default function Logout() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <main className="flex-1 px-8 pt-6 flex flex-col items-center">
        {/* Back Button */}
        <div className="w-full mb-12">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Title */}
        <h1 className="text-[56px] font-black mb-12 tracking-tight">{t('logout.title')}</h1>

        {/* Illustration */}
        <div className="w-full max-w-[300px] mb-16">
          <img 
            src={logoutImage} 
            alt="Logout Illustration" 
            className="w-full h-auto grayscale"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Question */}
        <p className="text-xl font-medium mb-16 text-center">
          {t('logout.confirmMessage')}
        </p>

        {/* Buttons */}
        <div className="w-full space-y-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(-1)}
            className="w-full py-5 bg-black text-white rounded-2xl font-bold text-2xl shadow-lg"
          >
            {t('common.cancel')}
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full py-5 bg-black text-white rounded-2xl font-bold text-2xl shadow-lg"
          >
            {t('logout.logoutNow')}
          </motion.button>
        </div>
      </main>
    </div>
  );
}

