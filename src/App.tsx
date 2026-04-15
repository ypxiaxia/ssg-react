/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Starting from './pages/Starting';
import Records from './pages/Records';
import Profile from './pages/Profile';
import Logout from './pages/Logout';
import ChangeLanguage from './pages/ChangeLanguage';
import VipLevels from './pages/VipLevels';
import Withdrawal from './pages/Withdrawal';
import WithdrawalHistory from './pages/WithdrawalHistory';
import Deposit from './pages/Deposit';
import AccountInfo from './pages/AccountInfo';
import UpdatePassword from './pages/UpdatePassword';
import BindWallet from './pages/BindWallet';
import Event from './pages/Event';
import Tc from './pages/Tc';
import Certificate from './pages/Certificate';
import About from './pages/About';
import Faqs from './pages/Faqs';
import ProtectedRoute from './components/ProtectedRoute';
import Notice from './pages/Notice';
import Contact from './pages/Contact';
import api from './services/api';
import i18n from './i18n/config';
import { useAuthStore } from './store/useAuthStore';

export default function App() {
  const setConfig = useAuthStore((state) => state.setConfig);

  useEffect(() => {
    const fetchAppConfig = async () => {
      try {
        const res = await api.post('/index/config', '', {
          headers: {
            Lang: i18n.language || 'en',
          },
        });
        const configData = res?.data || {};
        const currency =
          String(
            configData.currency ||
            configData.currency_symbol ||
            configData.money_unit ||
            'USD'
          ).trim() || 'USD';
        setConfig(
          Array.isArray(configData.kefu) ? configData.kefu : [],
          Number(configData.version) || 0,
          currency
        );
      } catch (error) {
        setConfig([], 0, 'USD');
      }
    };

    fetchAppConfig();
  }, [setConfig]);

  return (
    <Router>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/starting" element={<ProtectedRoute><Starting /></ProtectedRoute>} />
        <Route path="/records" element={<ProtectedRoute><Records /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/logout" element={<ProtectedRoute><Logout /></ProtectedRoute>} />
        <Route path="/change-language" element={<ProtectedRoute><ChangeLanguage /></ProtectedRoute>} />
        <Route path="/vip" element={<ProtectedRoute><VipLevels /></ProtectedRoute>} />
        <Route path="/withdrawal" element={<ProtectedRoute><Withdrawal /></ProtectedRoute>} />
        <Route path="/withdrawal-history" element={<ProtectedRoute><WithdrawalHistory /></ProtectedRoute>} />
        <Route path="/deposit" element={<ProtectedRoute><Deposit /></ProtectedRoute>} />
        <Route path="/account-info" element={<ProtectedRoute><AccountInfo /></ProtectedRoute>} />
        <Route path="/update-password" element={<ProtectedRoute><UpdatePassword /></ProtectedRoute>} />
        <Route path="/bind-wallet" element={<ProtectedRoute><BindWallet /></ProtectedRoute>} />
        <Route path="/event" element={<ProtectedRoute><Event /></ProtectedRoute>} />
        <Route path="/tc" element={<ProtectedRoute><Tc /></ProtectedRoute>} />
        <Route path="/certificate" element={<ProtectedRoute><Certificate /></ProtectedRoute>} />
        <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
        <Route path="/faqs" element={<ProtectedRoute><Faqs /></ProtectedRoute>} />
        <Route path="/notice" element={<ProtectedRoute><Notice /></ProtectedRoute>} />
        <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}










