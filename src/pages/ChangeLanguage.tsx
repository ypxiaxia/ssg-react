import React, { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

interface LanguageApiItem {
  lang: string;
  title: string;
  is_default: number;
}

interface LanguageItem {
  code: string;
  label: string;
  prefix: string;
  isDefault: boolean;
}

export default function ChangeLanguage() {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const { language, setLanguage } = useAuthStore();
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [selectedCode, setSelectedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    const fetchLanguageList = async () => {
      setLoading(true);
      try {
        const res = await api.get('/index/lang_list');
        const list = Array.isArray(res?.data) ? res.data : [];
        const mapped: LanguageItem[] = list.map((item: LanguageApiItem) => ({
          code: item.lang,
          label: item.title,
          prefix: item.lang,
          isDefault: Number(item.is_default) === 1,
        }));
        setLanguages(mapped);

        const defaultLanguage = mapped.find((item) => item.isDefault);
        if (language) {
          setSelectedCode(language);
        } else if (defaultLanguage) {
          setSelectedCode(defaultLanguage.code);
        } else if (mapped.length > 0) {
          setSelectedCode(mapped[0].code);
        }
      } catch (error) {
        setLanguages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLanguageList();
  }, []);

  const handleLanguageChange = async (code: string) => {
    if (switching) return;
    setSwitching(true);
    setSelectedCode(code);
    try {
      await api.get('/index/switchLang', {
        headers: {
          Lang: code,
          lang: code,
        },
      });
      setLanguage(code);
      await i18n.changeLanguage(code);
      navigate(-1);
    } catch (error) {
      // Error modal is handled by api interceptor.
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-12">
      <Header />
      
      <main className="px-6 pt-6">
        {/* Sub Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">{t('profile.sections.changeLanguage')}</h1>
          <div className="w-10"></div>
        </div>

        {/* Language List */}
        <div className="space-y-3">
          {loading ? (
            <p className="text-gray-400 font-medium text-center py-10">{t('history.loading')}</p>
          ) : languages.length === 0 ? (
            <p className="text-gray-400 font-medium text-center py-10">{t('history.noMoreData')}</p>
          ) : languages.map((lang) => {
            const isActive = selectedCode === lang.code;
            return (
              <motion.button
                key={lang.code}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLanguageChange(lang.code)}
                disabled={switching}
                className={`w-full py-4 rounded-xl font-bold text-xl flex items-center justify-center gap-2 transition-all border ${
                  isActive 
                    ? 'bg-[#D1B18D] text-white border-[#D1B18D]' 
                    : 'bg-white text-black border-gray-100 shadow-sm'
                } ${switching ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <span className={`uppercase text-sm ${isActive ? 'text-white/80' : 'text-black'}`}>
                  {lang.prefix}
                </span>
                <span>{lang.label}</span>
              </motion.button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
