import React, { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import qs from 'qs';

interface NoticeItem {
  id: number;
  keyword: string;
  content: string;
  create_time: string;
  read: number;
}

export default function Notice() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [noticeList, setNoticeList] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [readingId, setReadingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchNoticeList = async () => {
      try {
        const res = await api.get('/home/messageList', {
          headers: {
            Lang: i18n.language,
          },
        });
        setNoticeList(Array.isArray(res?.data) ? res.data : []);
      } catch (error) {
        setNoticeList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNoticeList();
  }, [i18n.language]);

  const handleMarkAsRead = async (id: number, read: number) => {
    if (read === 1 || readingId === id) return;
    setReadingId(id);
    try {
      await api.post('/home/messageRead', qs.stringify({ id }), {
        headers: {
          Lang: i18n.language,
        },
      });
      setNoticeList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, read: 1 } : item))
      );
    } catch (error) {
      // Error modal is handled by api interceptor.
    } finally {
      setReadingId(null);
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
          <h1 className="text-xl font-bold">{t('profile.sections.notifications')}</h1>
          <div className="w-10"></div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <p className="text-gray-400 font-medium">{t('history.loading')}</p>
          </div>
        ) : noticeList.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-400 font-medium">{t('history.noMoreData')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {noticeList.map((item) => (
              <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-base font-bold text-gray-900">{item.keyword || '-'}</h3>
                  <button
                    type="button"
                    onClick={() => handleMarkAsRead(item.id, Number(item.read))}
                    disabled={Number(item.read) === 1 || readingId === item.id}
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      Number(item.read) === 1
                        ? 'bg-gray-100 text-gray-500 cursor-default'
                        : 'bg-[#D1B18D]/20 text-[#8B6A49] hover:bg-[#D1B18D]/30'
                    } ${readingId === item.id ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {Number(item.read) === 1 ? t('notice.read') : t('notice.unread')}
                  </button>
                </div>
                <p className="text-sm text-gray-700 leading-6 mb-3 break-words">{item.content || '-'}</p>
                <p className="text-xs text-gray-400">{item.create_time || '-'}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
