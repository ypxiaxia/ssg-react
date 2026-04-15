import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthInput from '../components/AuthInput';
import AuthButton from '../components/AuthButton';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import qs from 'qs';

import { useAuthStore } from '../store/useAuthStore';
import { openKefuSelector } from '../utils/support';

export default function SignIn() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const kefu = useAuthStore((state) => state.kefu);
  const [username, setUsername] = useState('meteor');
  const [password, setPassword] = useState('lx123456..');
  const [loading, setLoading] = useState(false);

  const handleSupportClick = async () => {
    await openKefuSelector(kefu, 'Dazze Customer Service');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = qs.stringify({
      username: username,
      password: password
    });

    try {
      const res = await api.post('/login/index', data);
      console.log('Login Success:', JSON.stringify(res));
      
      // Save user data and token to store
      // Assuming the API returns { code: 200, data: { token: '...', user: {...} } }
      // Adjust based on actual response structure
      if (res.data && res.data.token) {
        setAuth(res.data.user || res.data, res.data.token);
        navigate('/');
      }
    } catch (err) {
      console.error('Login Error:', err);
      // Error message is already alerted by the interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-8 pt-20 pb-10 flex flex-col items-center">
      <h1 className="text-[56px] font-bold mb-4">{t('auth.signInTitle')}</h1>
      <p className="text-gray-600 mb-10 text-center font-medium">
        {t('auth.authSubtitle')}
      </p>

      <form className="w-full space-y-6 mb-6" onSubmit={handleSignIn}>
        <AuthInput 
          placeholder={t('auth.username')} 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <AuthInput 
          placeholder={t('auth.password')} 
          isPassword 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <div className="flex items-center justify-between px-1">
          <button type="button" onClick={handleSupportClick} className="text-sm font-bold hover:underline">
            {t('auth.forgotPassword')}
          </button>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-5 h-5 accent-[#D1B18D] rounded" defaultChecked />
            <span className="text-sm font-bold">{t('auth.rememberPassword')}</span>
          </label>
        </div>

        <div className="pt-4">
          <AuthButton type="submit" disabled={loading}>
            {loading ? '...' : t('auth.signIn')}
          </AuthButton>
        </div>
      </form>

      <div className="space-y-4 text-center">
        <p className="font-medium">
          {t('auth.noAccount')}{' '}
          <Link to="/signup" className="font-bold underline">
            {t('auth.signUp')}
          </Link>
        </p>
        <p className="font-medium">
          {t('auth.cantSignIn')}{' '}
          <button type="button" onClick={handleSupportClick} className="font-bold underline">
            {t('auth.contactSupport')}
          </button>
        </p>
      </div>
    </div>
  );
}

