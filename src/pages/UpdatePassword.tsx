import React, { useState } from 'react';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import Swal from 'sweetalert2';

export default function UpdatePassword() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const type = searchParams[0].get('type') === 'transaction' ? 'transaction' : 'password';

  const handleSubmit = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Swal.fire({
        text: t('password.requiredError'),
        icon: 'error',
        confirmButtonColor: '#000000',
        confirmButtonText: t('common.submit'),
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire({
        text: t('password.mismatchError'),
        icon: 'error',
        confirmButtonColor: '#000000',
        confirmButtonText: t('common.submit'),
      });
      return;
    }

    const data = new URLSearchParams();
    data.append('old', oldPassword);
    if (type === 'transaction') {
      data.append('pay_pwd', newPassword);
      data.append('re_pay_pwd', confirmPassword);
    } else {
      data.append('pwd', newPassword);
      data.append('re_pwd', confirmPassword);
    }

    try {
      setSubmitting(true);
      await api.post(type === 'transaction' ? '/user/pay_pwd' : '/user/pass_word', data);
      await Swal.fire({
        text: t('password.updateSuccess'),
        icon: 'success',
        confirmButtonColor: '#000000',
        confirmButtonText: t('common.submit'),
        customClass: {
          popup: 'rounded-[1.5rem]',
          confirmButton: 'rounded-xl px-8 py-3 font-bold',
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
          <h1 className="text-xl font-bold">{type === 'password' ? t('password.title') : t('password.title1')}</h1>
          <div className="w-10"></div>
        </div>

        <div className="space-y-4 mb-10">
          {/* Old Password */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <p className="text-lg font-bold mb-3">{t('password.oldPassword')}</p>
            <div className="flex items-center justify-between">
              <input 
                type={showOld ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder={t('password.oldPassword')}
                className="bg-transparent border-none outline-none text-gray-500 font-medium w-full"
              />
              <button type="button" onClick={() => setShowOld(!showOld)} className="text-gray-400">
                {showOld ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <p className="text-lg font-bold mb-3">{t('password.newPassword')}</p>
            <div className="flex items-center justify-between">
              <input 
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('password.newPassword')}
                className="bg-transparent border-none outline-none text-gray-500 font-medium w-full"
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="text-gray-400">
                {showNew ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <p className="text-lg font-bold mb-3">{t('password.confirmNewPassword')}</p>
            <div className="flex items-center justify-between">
              <input 
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('password.confirmNewPassword')}
                className="bg-transparent border-none outline-none text-gray-500 font-medium w-full"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-gray-400">
                {showConfirm ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Update Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-5 bg-gray-500 text-white rounded-xl font-bold text-2xl shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? t('password.updating') : t('password.update')}
        </motion.button>
      </main>
    </div>
  );
}
