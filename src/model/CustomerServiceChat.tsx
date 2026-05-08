import { ImagePlus, MessageCircle, Send, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

const AUTH_PATHS = new Set(['/signin', '/signup']);

type ChatMessage = {
  id: string;
  content: string;
  type: 'text' | 'image';
  sender: 'user' | 'support' | 'system';
  time: string;
  history?: boolean;
};

type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';
type SocketPackage = {
  cmd: string;
  data: unknown;
  ext: Record<string, unknown> | null;
};
type ParsedIncomingMessage = Pick<ChatMessage, 'content' | 'type'> & {
  ackMsgId?: unknown;
};
type HistoryMessageItem = {
  id: number;
  send_data: string;
  type: number;
  created_at: string;
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const HISTORY_PAGE_SIZE = 10;

const createMessage = (
  content: string,
  sender: ChatMessage['sender'],
  type: ChatMessage['type'] = 'text'
): ChatMessage => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  content,
  type,
  sender,
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
});

const parseIncomingMessage = (data: MessageEvent['data']) => {
  if (typeof data !== 'string') return null;

  try {
    const parsed = JSON.parse(data);
    if (parsed.cmd === 'heart') return null;

    const payload = parsed.data && typeof parsed.data === 'object' ? parsed.data : parsed;
    const isImage = parsed.cmd === 'image' || payload.type === 'image' || payload.image || payload.imageUrl;
    const content = String(
      payload.content || payload.message || payload.msg || payload.data || payload.imageUrl || payload.image || ''
    ).trim();

    const ackMsgId = parsed.cmd === 'server' && parsed.ext && typeof parsed.ext === 'object'
      ? parsed.ext.msgId
      : undefined;

    if (!content) return ackMsgId === undefined ? null : ({ content: '', type: 'text', ackMsgId } as ParsedIncomingMessage);
    return {
      content,
      type: isImage ? 'image' : 'text',
      ackMsgId,
    } as ParsedIncomingMessage;
  } catch (error) {
    const content = data.trim();
    return content ? ({ content, type: 'text' } as ParsedIncomingMessage) : null;
  }
};

const buildSocketUrl = (socketUrl: string, token: string | null) => {
  if (!token) return socketUrl;

  const url = new URL(socketUrl, window.location.href);
  url.searchParams.set('token', token);
  return url.toString();
};

const getImageSrc = (src: string) => {
  const normalizedSrc = src.replace(/\\/g, '/');
  if (/^(data:|blob:|https?:\/\/)/i.test(normalizedSrc)) return normalizedSrc;
  if (normalizedSrc.startsWith('/')) return `/api${normalizedSrc}`;
  return normalizedSrc;
};

const isImageContent = (content: string) => {
  const normalizedContent = content.replace(/\\/g, '/');
  return /^(data:image\/|blob:)/i.test(normalizedContent)
    || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(normalizedContent);
};

const mapHistoryMessage = (item: HistoryMessageItem): ChatMessage => {
  const content = String(item.send_data || '');
  return {
    id: `history-${item.id}`,
    content,
    type: isImageContent(content) ? 'image' : 'text',
    sender: item.type === 2 ? 'user' : 'support',
    time: item.created_at || '',
    history: true,
  };
};

const createSocketPackage = (
  cmd: string,
  data: unknown,
  ext: Record<string, unknown> | null = {}
): SocketPackage => ({
  cmd,
  data,
  ext,
});

export default function CustomerServiceChat() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [historyPage, setHistoryPage] = useState(0);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    createMessage(t('support.welcome'), 'support'),
  ]);
  const socketRef = useRef<WebSocket | null>(null);
  const heartbeatTimerRef = useRef<number | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const openRef = useRef(false);
  const suppressNextScrollRef = useRef(false);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const hidden = AUTH_PATHS.has(location.pathname);
  const supportSocketUrl = useMemo(() => {
    const url = new URL('/ws', window.location.href);
    url.protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return url.toString();
  }, []);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length !== 1 || prev[0].sender !== 'support') return prev;
      return [{ ...prev[0], content: t('support.welcome') }];
    });
  }, [t]);

  useEffect(() => {
    openRef.current = open;
    if (open) {
      setUnreadCount(0);
    }
  }, [open]);

  useEffect(() => {
    if (hidden) return;

    if (!supportSocketUrl) {
      setConnectionStatus('error');
      return;
    }

    setConnectionStatus('connecting');
    const socket = new WebSocket(buildSocketUrl(supportSocketUrl, token));
    socketRef.current = socket;

    const sendHeartbeat = () => {
      if (socket.readyState !== WebSocket.OPEN) return;
      socket.send(
        JSON.stringify(
          createSocketPackage('heart', null, null)
        )
      );
    };

    socket.onopen = () => {
      setConnectionStatus('connected');
      sendHeartbeat();
      heartbeatTimerRef.current = window.setInterval(sendHeartbeat, 10000);
    };

    socket.onmessage = (event) => {
      const message = parseIncomingMessage(event.data);
      if (!message) return;
      if (message.ackMsgId !== undefined && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(createSocketPackage('msgAck', null, { msgId: message.ackMsgId })));
      }
      if (message.content) {
        setMessages((prev) => [...prev, createMessage(message.content, 'support', message.type)]);
      }
      if (!openRef.current) {
        setUnreadCount((prev) => Math.min(prev + 1, 99));
      }
    };

    socket.onerror = () => {
      setConnectionStatus('error');
    };

    socket.onclose = () => {
      setConnectionStatus((prev) => (prev === 'error' ? prev : 'disconnected'));
    };

    return () => {
      if (heartbeatTimerRef.current) {
        window.clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = null;
      }
      socket.close();
      socketRef.current = null;
    };
  }, [hidden, supportSocketUrl, token, user?.id, user?.username]);

  useEffect(() => {
    if (!open) return;
    if (suppressNextScrollRef.current) {
      suppressNextScrollRef.current = false;
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, open]);

  const loadHistoryMessages = useCallback(async (targetPage: number) => {
    if (loadingHistory || (targetPage > 1 && !hasMoreHistory)) return;

    const listEl = messagesContainerRef.current;
    const previousScrollHeight = listEl?.scrollHeight || 0;
    const data = new URLSearchParams();
    data.append('page', String(targetPage));
    data.append('size', String(HISTORY_PAGE_SIZE));

    try {
      setLoadingHistory(true);
      const res = await api.post('/user/messageList', data, {
        headers: {
          Lang: i18n.language || 'en',
          'X-Token': token || '',
        },
      });
      const list = Array.isArray(res?.data?.list) ? res.data.list : [];
      const historyMessages = list
        .map(mapHistoryMessage)
        .reverse();

      if (targetPage > 1) {
        suppressNextScrollRef.current = true;
      }
      setMessages((prev) => {
        const existingIds = new Set(prev.map((message) => message.id));
        const nextHistory = historyMessages.filter((message) => !existingIds.has(message.id));

        if (targetPage === 1) {
          const liveMessages = prev.filter(
            (message) => !message.history && !(message.sender === 'support' && message.content === t('support.welcome'))
          );
          const mergedMessages = [...nextHistory, ...liveMessages];
          return mergedMessages.length > 0 ? mergedMessages : [createMessage(t('support.welcome'), 'support')];
        }

        return [...nextHistory, ...prev];
      });
      setHistoryPage(targetPage);
      setHasMoreHistory(list.length === HISTORY_PAGE_SIZE);
      setHistoryLoaded(true);

      if (targetPage > 1) {
        window.setTimeout(() => {
          if (!listEl) return;
          listEl.scrollTop = listEl.scrollHeight - previousScrollHeight;
        }, 0);
      }
    } catch (error) {
      if (targetPage === 1) {
        setHistoryLoaded(true);
      }
    } finally {
      setLoadingHistory(false);
    }
  }, [hasMoreHistory, i18n.language, loadingHistory, t, token]);

  useEffect(() => {
    if (!open || historyLoaded) return;
    loadHistoryMessages(1);
  }, [historyLoaded, loadHistoryMessages, open]);

  const handleMessagesScroll = () => {
    if (!hasMoreHistory || loadingHistory) return;
    const scrollTop = messagesContainerRef.current?.scrollTop || 0;
    if (scrollTop <= 24) {
      loadHistoryMessages(historyPage + 1);
    }
  };

  if (hidden) return null;

  const sendSocketMessage = (messagePackage: SocketPackage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(messagePackage));
      return true;
    }
    setMessages((prev) => [...prev, createMessage(t('support.connectError'), 'system')]);
    setConnectionStatus('error');
    return false;
  };

  const handleSendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = inputValue.trim();
    if (!content) return;

    setMessages((prev) => [...prev, createMessage(content, 'user')]);
    setInputValue('');
    sendSocketMessage(
      createSocketPackage(
        'msgSend',
        {
          type: 1,
          msg: content,
        },
        null
      )
    );
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessages((prev) => [...prev, createMessage(t('support.imageTypeError'), 'system')]);
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setMessages((prev) => [...prev, createMessage(t('support.imageSizeError'), 'system')]);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', 'message');

    try {
      setUploadingImage(true);
      const res = await api.post('/user/uploadFile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Lang: i18n.language || 'en',
          'X-Token': token || '',
        },
      });
      const uploadedFile = String(res?.data?.file || '').trim();
      if (!uploadedFile) {
        throw new Error('Missing uploaded file path');
      }

      setMessages((prev) => [...prev, createMessage(uploadedFile, 'user', 'image')]);
      sendSocketMessage(
        createSocketPackage(
          'msgSend',
          {
            type: 2,
            msg: uploadedFile,
          },
          null
        )
      );
    } catch (error) {
      setMessages((prev) => [...prev, createMessage(t('support.uploadError'), 'system')]);
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('support.floatingButton')}
        className="fixed right-5 bottom-24 z-[80] w-14 h-14 rounded-full bg-black text-white shadow-2xl flex items-center justify-center active:scale-95 transition-transform"
      >
        <MessageCircle className="w-7 h-7" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[95] bg-black/40 px-4 flex items-end justify-center sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label={t('support.title')}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden mb-0 sm:mb-0"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="bg-black text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold leading-tight">{t('support.title')}</h2>
                  <p className="text-xs text-white/70">{t(`support.status.${connectionStatus}`)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t('common.cancel')}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-[420px] bg-gray-50 flex flex-col">
              <div
                ref={messagesContainerRef}
                onScroll={handleMessagesScroll}
                className="flex-1 overflow-y-auto px-5 py-5 space-y-3"
              >
                {loadingHistory && (
                  <p className="text-center text-xs text-gray-400">{t('history.loading')}</p>
                )}
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[82%] rounded-2xl px-4 py-3 ${
                        message.sender === 'user'
                          ? 'rounded-br-sm bg-black text-white'
                          : message.sender === 'system'
                            ? 'bg-orange-50 text-orange-600 border border-orange-100'
                            : 'rounded-bl-sm bg-white text-gray-800 shadow-sm'
                      }`}
                    >
                      {message.type === 'image' ? (
                        <img
                          src={getImageSrc(message.content)}
                          alt={t('support.imageMessage')}
                          className="max-h-44 max-w-full rounded-xl object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <p className="text-sm leading-6 break-words">{message.content}</p>
                      )}
                      <p
                        className={`mt-1 text-[10px] ${
                          message.sender === 'user' ? 'text-white/60' : 'text-gray-400'
                        }`}
                      >
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="border-t border-gray-100 bg-white p-4 flex gap-3">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingImage}
                  aria-label={t('support.uploadImage')}
                  className="w-12 h-12 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ImagePlus className="w-5 h-5" />
                </button>
                <input
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  placeholder={t('support.placeholder')}
                  className="min-w-0 flex-1 rounded-full bg-gray-100 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  aria-label={t('support.send')}
                  className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
