import { Home, FileText } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

export default function BottomNav() {
  const location = useLocation();
  const { t } = useTranslation();
  const isHome = location.pathname === '/';
  const isRecords = location.pathname === '/records';
  const isStarting = location.pathname === '/starting';

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-8 py-3 flex items-center justify-between z-50">
      <Link to="/" className="flex flex-col items-center gap-1">
        <Home className={`w-6 h-6 ${isHome ? 'text-black' : 'text-gray-400'}`} />
        <span className={`text-xs font-bold ${isHome ? 'text-black' : 'text-gray-400'}`}>{t('common.home')}</span>
      </Link>

      <div className="relative -top-8">
        <div className="absolute inset-0 bg-white rounded-full scale-125 -z-10 shadow-sm border border-gray-100"></div>
        <Link to="/starting">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-4 border-white ${
              isStarting ? 'bg-black' : 'bg-[#D1B18D]'
            }`}
          >
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-white leading-none mb-0.5">dazze.</span>
              <span className="text-[10px] font-medium text-white/80 leading-none">{t('common.starting')}</span>
            </div>
          </motion.button>
        </Link>
      </div>

      <Link to="/records" className="flex flex-col items-center gap-1">
        <FileText className={`w-6 h-6 ${isRecords ? 'text-black' : 'text-gray-400'}`} />
        <span className={`text-xs font-bold ${isRecords ? 'text-black' : 'text-gray-400'}`}>{t('common.records')}</span>
      </Link>
    </nav>
  );
}


