import React, { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import qs from 'qs';
import { useAuthStore } from '../store/useAuthStore';
import { openKefuSelector } from '../utils/support';


export default function Contact() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [contactHtml, setContactHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const kefu = useAuthStore((state) => state.kefu);

  useEffect(() => {
    const decodeHtmlEntities = (html: string) => {
      const textarea = document.createElement('textarea');
      textarea.innerHTML = html;
      return textarea.value;
    };

    const fetchContact = async () => {
      try {
        const res = await api.post('/index/article', qs.stringify({ url: 'index/contact' }));
        setContactHtml(decodeHtmlEntities(String(res?.data || '')));
      } catch (error) {
        setContactHtml('');
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, []);

  const handleContactSupport = async () => {
    await openKefuSelector(kefu, 'Dazze Customer Service');
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
          <h1 className="text-xl font-bold">{t('common.contact')}</h1>
          <div className="w-10"></div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          {loading ? (
            <p className="text-sm text-gray-500">{t('history.loading')}</p>
          ) : (
            <div
              className="about-content text-sm text-gray-800 leading-7"
              dangerouslySetInnerHTML={{ __html: contactHtml || '<p>'+t('history.noMoreData')+'</p>' }}
            />
          )}
        </div>
        <div className="h-10"></div>
        <button
          type="button"
          onClick={handleContactSupport}
          className="w-full py-4 bg-black text-white rounded-xl font-bold text-base shadow-md"
        >
          Dazze Customer Service
        </button>
      </main>

      <style>{`
        .about-content span {
          white-space: normal !important;
          word-break: break-word;
          overflow-wrap: anywhere;
          text-wrap: wrap;
        }
      `}</style>
    </div>
  );
}
