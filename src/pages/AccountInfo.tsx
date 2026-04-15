import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronDown, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useTranslation } from 'react-i18next';
import { useFetchUser } from '../hooks/useFetchUser';
import api from '../services/api';
import Swal from 'sweetalert2';

export default function AccountInfo() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, refetch } = useFetchUser();
  const defaultAvatar = "https://picsum.photos/seed/avatar/300/300";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarObjectUrlRef = useRef<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(defaultAvatar);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    setAvatarPreview(user?.avatar || defaultAvatar);
  }, [user, t]);

  useEffect(() => {
    return () => {
      if (avatarObjectUrlRef.current) {
        URL.revokeObjectURL(avatarObjectUrlRef.current);
      }
    };
  }, []);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const previousAvatar = avatarPreview;
    if (avatarObjectUrlRef.current) {
      URL.revokeObjectURL(avatarObjectUrlRef.current);
    }

    const previewUrl = URL.createObjectURL(file);
    avatarObjectUrlRef.current = previewUrl;
    setAvatarPreview(previewUrl);

    const data = new FormData();
    data.append('file', file);

    try {
      setUploadingAvatar(true);
      await api.post('/user/avatar', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-Token': user?.token || '',
        },
      });
      await refetch();
      Swal.fire({
        text: t('account.avatarUploadSuccess'),
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          popup: 'rounded-[1.5rem]',
        },
      });
    } catch (error) {
      setAvatarPreview(previousAvatar);
    } finally {
      setUploadingAvatar(false);
      event.target.value = '';
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
          <h1 className="text-xl font-bold">{t('account.title')}</h1>
          <div className="w-10"></div>
        </div>

        <h2 className="text-3xl font-black mb-8">{t('account.myProfile')}</h2>

        <div className="space-y-4 mb-12">
          {/* Avatar Upload Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <p className="text-lg font-bold mb-4">{t('account.avatar')}</p>
            <div className="flex items-center justify-between gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-200">
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <button
                type="button"
                disabled={uploadingAvatar}
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-black text-white rounded-xl font-bold text-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Camera className="w-4 h-4" />
                {uploadingAvatar ? t('account.uploadingAvatar') : t('account.uploadAvatar')}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Update Password Link */}
          <button 
            onClick={() => navigate('/update-password?type=password')}
            className="w-full bg-white border border-gray-200 rounded-2xl p-6 flex items-center justify-between"
          >
            <span className="font-bold">{t('account.updatePassword')}</span>
            <ChevronDown className="w-6 h-6" />
          </button>

          {/* Update Transaction Password Link */}
          <button 
            onClick={() => navigate('/update-password?type=transaction')}
            className="w-full bg-white border border-gray-200 rounded-2xl p-6 flex items-center justify-between"
          >
            <span className="font-bold">{t('account.updateTransactionPassword')}</span>
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>
      </main>
    </div>
  );
}
