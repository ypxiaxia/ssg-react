import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronDown, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import Swal from 'sweetalert2';

interface WalletCurrency {
  id: number;
  name: string;
  networks: string[];
  account: string;
}

interface WalletItemApi {
  id: number;
  account: string | null;
  type: string;
  network: string | null;
}

const normalizeText = (value: string) => value.replace(/[\s\-_]/g, '').toLowerCase();

const parseNetworks = (networkRaw: string | null) => {
  if (!networkRaw) return [];
  try {
    const parsed = JSON.parse(networkRaw);
    if (Array.isArray(parsed?.network)) {
      return parsed.network.map((n: string) => String(n).trim()).filter(Boolean);
    }
    return [];
  } catch {
    return [];
  }
};

const DEFAULT_CURRENCY: WalletCurrency = {
  id: 0,
  name: 'USDT',
  networks: ['TRC20', 'ERC20'],
  account: '',
};

export default function BindWallet() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currencies, setCurrencies] = useState<WalletCurrency[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<WalletCurrency | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [address, setAddress] = useState('');
  const [cardId, setCardId] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const applyDefaultCurrency = () => {
      setCurrencies([DEFAULT_CURRENCY]);
      setSelectedCurrency(DEFAULT_CURRENCY);
      setSelectedNetwork(DEFAULT_CURRENCY.networks[0]);
      setAddress(DEFAULT_CURRENCY.account);
      setCardId(0);
    };

    const fetchWalletInfo = async () => {
      try {
        const res = await api.post('/account/usdt_info');
        const walletInfo = res?.data || {};
        const walletList: WalletItemApi[] = Array.isArray(walletInfo.wallet) ? walletInfo.wallet : [];
        const cardInfo = walletInfo.card || null;

        if (walletList.length === 0) {
          applyDefaultCurrency();
          return;
        }

        const parsedCurrencies: WalletCurrency[] = walletList.map((item) => ({
          id: Number(item.id) || 0,
          name: String(item.type || '').trim(),
          networks: parseNetworks(item.network),
          account: item.account || '',
        })).filter((item) => item.name);

        if (parsedCurrencies.length === 0) {
          applyDefaultCurrency();
          return;
        }

        setCurrencies(parsedCurrencies);

        const cardType = String(cardInfo?.type || '');
        const matchedCurrency = parsedCurrencies.find((currency) => {
          return normalizeText(cardType).includes(normalizeText(currency.name));
        }) || parsedCurrencies[0];

        const cardNetwork = String(cardInfo?.network || '');
        const matchedNetwork = matchedCurrency.networks.find((network) => {
          if (cardNetwork && normalizeText(cardNetwork) === normalizeText(network)) return true;
          return normalizeText(cardType).includes(normalizeText(network));
        }) || matchedCurrency.networks[0] || '';

        setSelectedCurrency(matchedCurrency);
        setSelectedNetwork(matchedNetwork);
        setAddress(cardInfo?.account || matchedCurrency.account || '');
        setCardId(Number(cardInfo?.id) || 0);
      } catch (error) {
        // Global error modal is handled by api interceptor.
        applyDefaultCurrency();
      }
    };

    fetchWalletInfo();
  }, []);

  const handleCurrencyChange = (currencyId: string) => {
    const currency = currencies.find((c) => String(c.id) === currencyId);
    if (!currency) return;

    setSelectedCurrency(currency);
    setSelectedNetwork(currency.networks[0] || '');
    setAddress(currency.account);
  };

  const handleSubmit = async () => {
    const currentAddress = address.trim();
    if (!currentAddress) {
      Swal.fire({
        text: t('wallet.addressRequired'),
        icon: 'error',
        confirmButtonColor: '#000000',
        confirmButtonText: t('common.submit'),
      });
      return;
    }

    const currentName = selectedCurrency?.name || DEFAULT_CURRENCY.name;
    const currentNetwork = selectedNetwork || selectedCurrency?.networks[0] || DEFAULT_CURRENCY.networks[0];

    const data = new URLSearchParams();
    data.append('id', String(cardId));
    data.append('usdt', currentAddress);
    data.append('usdt_type', `${currentName}-${currentNetwork}`);
    data.append('account', currentAddress);

    try {
      setSubmitting(true);
      await api.post('/account/usdt_bind', data);
      await Swal.fire({
        text: t('wallet.bindSuccess'),
        icon: 'success',
        timer: 1200,
        showConfirmButton: false,
        customClass: {
          popup: 'rounded-[1.5rem]',
        },
      });
      navigate(-1);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-12">
      <Header />
      
      <main className="px-6 pt-6">
        {/* Sub Header */}
        <div className="flex items-center justify-between mb-10">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">{t('wallet.title')}</h1>
          <div className="w-10"></div>
        </div>

        {/* Hero Icon */}
        <div className="flex justify-center mb-10">
          <div className="w-24 h-24 bg-black rounded-[2rem] flex items-center justify-center shadow-2xl transform rotate-12">
            <Wallet className="w-12 h-12 text-[#D1B18D] -rotate-12" />
          </div>
        </div>

        <div className="space-y-6 mb-12">
          {/* Select Currency */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <p className="text-sm font-bold mb-3 uppercase tracking-wider text-gray-400">
              {t('wallet.selectCurrency')}
            </p>
            <div className="relative">
              <select 
                value={selectedCurrency ? String(selectedCurrency.id) : ''}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-xl font-black appearance-none cursor-pointer"
              >
                {currencies.map((c) => (
                  <option key={c.id} value={String(c.id)}>{c.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Network */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <p className="text-sm font-bold mb-3 uppercase tracking-wider text-gray-400">
              {t('wallet.network')}
            </p>
            <div className="relative">
              <select 
                value={selectedNetwork}
                onChange={(e) => setSelectedNetwork(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-xl font-black appearance-none cursor-pointer"
              >
                {(selectedCurrency?.networks || []).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Wallet Address */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <p className="text-sm font-bold mb-3 uppercase tracking-wider text-gray-400">
              {t('wallet.walletAddress')}
            </p>
            <input 
              type="text" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t('wallet.placeholderAddress')}
              className="w-full bg-transparent border-none outline-none text-lg font-medium placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-5 bg-black text-white rounded-2xl font-bold text-2xl shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? t('wallet.binding') : t('wallet.bindNow')}
        </motion.button>

        <p className="mt-8 text-center text-xs font-medium text-gray-400 px-4 leading-relaxed">
          * Please make sure the wallet address and network are correct. 
          Incorrect information may lead to loss of funds.
        </p>
      </main>
    </div>
  );
}
