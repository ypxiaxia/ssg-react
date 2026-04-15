import { Star, LayoutGrid, Calendar, ArrowUpCircle, Wallet, FileText, Award, MessageCircle, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation();

  const MENU_ITEMS = [
    { icon: LayoutGrid, label: t('home.menu.vip'), color: 'bg-black' },
    { icon: Calendar, label: t('home.menu.activity'), color: 'bg-black' },
    { icon: ArrowUpCircle, label: t('home.menu.withdrawal'), color: 'bg-black' },
    { icon: Wallet, label: t('home.menu.deposit'), color: 'bg-black' },
    { icon: FileText, label: t('home.menu.tc'), color: 'bg-black' },
    { icon: Award, label: t('home.menu.certificate'), color: 'bg-black' },
    { icon: MessageCircle, label: t('home.menu.faqs'), color: 'bg-black' },
    { icon: Info, label: t('home.menu.about'), color: 'bg-black' },
  ];

  return (
    <div className="min-h-screen bg-white pb-24">
      <Header />
      
      <main className="px-6 pt-8">
        {/* Reviews */}
        <div className="flex items-center justify-center gap-1 mb-4">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-black text-black" />
            ))}
          </div>
          <span className="text-sm font-bold">{t('home.reviews')}</span>
        </div>

        {/* Hero Title */}
        <div className="text-center mb-6">
          <h1 className="text-[44px] font-bold leading-[1.1] tracking-tight mb-4">
            {t('home.heroTitle')}
          </h1>
          <p className="text-lg text-gray-800 px-4">
            {t('home.heroSubtitle')}
          </p>
        </div>

        {/* Action Button */}
        <div className="flex justify-center mb-10">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="bg-black text-white px-10 py-4 rounded-xl font-bold text-xl tracking-wide"
          >
            {t('home.ourProjects')}
          </motion.button>
        </div>


        {/* Hero Media */}
        <div className="rounded-2xl overflow-hidden mb-10 shadow-lg">
          <video
            src="/home.mp4"
            className="w-full h-auto object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
        </div>

        {/* Icon Grid */}
        <div className="grid grid-cols-4 gap-y-8 gap-x-4 mb-12">
          {MENU_ITEMS.map((item, index) => {
            let to = '#';
            if (item.label === t('home.menu.vip')) to = '/vip';
            if (item.label === t('home.menu.withdrawal')) to = '/withdrawal';
            if (item.label === t('home.menu.deposit')) to = '/deposit';
            if (item.label === t('home.menu.activity')) to = '/event';
            if (item.label === t('home.menu.tc')) to = '/tc';
            if (item.label === t('home.menu.certificate')) to = '/certificate';
            if (item.label === t('home.menu.about')) to = '/about';
            if (item.label === t('home.menu.faqs')) to = '/faqs';

            return (
              <Link 
                key={index} 
                to={to}
                className="flex flex-col items-center gap-2"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="w-14 h-14 rounded-full bg-black flex items-center justify-center text-white shadow-md"
                >
                  <item.icon className="w-7 h-7" />
                </motion.div>
                <span className="text-xs font-medium text-gray-800">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
