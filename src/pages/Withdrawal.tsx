import React, { useState } from 'react';
import { ChevronLeft, FileText, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useFetchUser } from '../hooks/useFetchUser';
import api from '../services/api';
import qs from 'qs';
import Swal from 'sweetalert2';
import { useAuthStore } from '../store/useAuthStore';

export default function Withdrawal() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [payPassword, setPayPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user, refetch } = useFetchUser();
  const currency = useAuthStore((state) => state.currency) || 'USD';

  const formatCurrency = (value: any) => {
    const num = parseFloat(value || 0);
    return num.toFixed(2);
  };

  const totalBalance = formatCurrency(user?.user_money);
  const availableAmount = formatCurrency(user?.user_money);
  const freezeAmount = formatCurrency(user?.freeze_money);

  const handleFillAll = () => {
    setWithdrawAmount(availableAmount);
  };

  const handleSubmitWithdraw = async () => {
    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      Swal.fire({
        text: t('withdrawal.withdrawAmount'),
        icon: 'warning',
        confirmButtonColor: '#000000',
      });
      return;
    }

    if (!payPassword) {
      Swal.fire({
        text: t('withdrawal.transactionPassword'),
        icon: 'warning',
        confirmButtonColor: '#000000',
      });
      return;
    }

    setSubmitting(true);
    try {
      const data = qs.stringify({
        money: withdrawAmount,
        paypwd: payPassword,
        type: 2,
      });
      await api.post('/account/cash', data);
      await refetch();
      setWithdrawAmount('');
      setPayPassword('');

      Swal.fire({
        text: 'Submitted successfully',
        icon: 'success',
        confirmButtonColor: '#000000',
      });
    } catch (error) {
      // Error modal is handled by api interceptor.
    } finally {
      setSubmitting(false);
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
          <h1 className="text-xl font-bold">{t('withdrawal.title')}</h1>
          <div className="w-10"></div>
        </div>

        {/* Balance Card */}
        <div className="bg-black text-white rounded-3xl p-8 mb-6 relative overflow-hidden shadow-xl">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold">{t('withdrawal.totalBalance')}</h2>
            <Link to="/withdrawal-history" className="flex items-center gap-2 text-sm font-medium">
              <FileText className="w-5 h-5" />
              {t('withdrawal.history')}
            </Link>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-bold">{totalBalance}</span>
            <span className="text-sm font-bold opacity-80">{currency}</span>
          </div>
          <p className="text-xs font-medium text-gray-400">
            {t('withdrawal.notice')}
          </p>
        </div>

        {/* Amounts Card */}
        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm mb-10">
          <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
            <span className="font-bold">{t('withdrawal.availableAmount')}</span>
            <span className="font-bold">{availableAmount} {currency}</span>
          </div>
          <div className="flex justify-between items-center px-6 py-5">
            <span className="font-bold">{t('withdrawal.freezeAmount')}</span>
            <span className="font-bold">{freezeAmount} {currency}</span>
          </div>
        </div>

        {/* Form Section */}
        <h3 className="text-2xl font-black mb-6 uppercase tracking-tight">
          {t('withdrawal.withdrawAmount')}
        </h3>

        <div className="space-y-4 mb-10">

          {/* Withdraw Amount */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-sm font-bold mb-3">{t('withdrawal.withdrawAmount')}</p>
            <div className="flex items-center justify-between">
              <input 
                type="number" 
                placeholder="0"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="bg-transparent border-none outline-none text-lg font-bold w-full"
              />
              <button type="button" onClick={handleFillAll} className="bg-[#D1B18D] text-white text-[10px] font-bold px-4 py-2 rounded-lg">
                {t('withdrawal.all')}
              </button>
            </div>
          </div>

          {/* Transaction Password */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-sm font-bold mb-3">{t('withdrawal.transactionPassword')}</p>
            <div className="flex items-center justify-between">
              <input 
                type={showPassword ? "text" : "password"}
                placeholder={t('withdrawal.transactionPassword')}
                value={payPassword}
                onChange={(e) => setPayPassword(e.target.value)}
                className="bg-transparent border-none outline-none text-sm font-medium w-full"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmitWithdraw}
          disabled={submitting}
          type="button"
          className="w-full py-5 bg-black text-white rounded-2xl font-bold text-2xl shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? `${t('common.submit')}...` : t('common.submit')}
        </motion.button>
      </main>
    </div>
  );
}
