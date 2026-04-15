import React, { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import qs from 'qs';


export default function Activity() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [aboutHtml, setAboutHtml] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const decodeHtmlEntities = (html: string) => {
      const textarea = document.createElement('textarea');
      textarea.innerHTML = html;
      return textarea.value;
    };

    const fetchAbout = async () => {
      try {
        const res = await api.post('/index/article', qs.stringify({ url: 'index/about' }));
        setAboutHtml(decodeHtmlEntities(String(res?.data || '')));
      } catch (error) {
        setAboutHtml('');
      } finally {
        setLoading(false);
      }
    };

    fetchAbout();
  }, []);


  return (
    <div className="min-h-screen bg-white pb-12">
      <Header />
      
      <main className="px-6 pt-6">
        {/* Sub Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">{t('home.menu.about')}</h1>
          <div className="w-10"></div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          {loading ? (
            <p className="text-sm text-gray-500">{t('history.loading')}</p>
          ) : (
            <div
              className="about-content text-sm text-gray-800 leading-7"
              dangerouslySetInnerHTML={{ __html: aboutHtml || '<p>'+t('history.noMoreData')+'</p>' }}
            />
          )}
        </div>
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
