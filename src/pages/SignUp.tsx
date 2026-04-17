import { Link, useNavigate } from 'react-router-dom';
import { useState, type FormEvent } from 'react';
import AuthInput from '../components/AuthInput';
import AuthButton from '../components/AuthButton';
import { useTranslation } from 'react-i18next';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { isValidPhoneNumber } from 'libphonenumber-js';
import api from '../services/api';
import qs from 'qs';
import { useAuthStore } from '../store/useAuthStore';
import Swal from 'sweetalert2';

export default function SignUp() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [payPassword, setPayPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sex, setSex] = useState<'1' | '2'>('1');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  const decodeHtmlEntities = (html: string) => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = html;
    return textarea.value;
  };

  const handleShowTerms = async () => {
    Swal.fire({
      title: t('auth.termsConditions'),
      text: 'Loading...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const res = await api.post('/index/article', qs.stringify({ url: 'index/tc' }));
      const htmlContent = decodeHtmlEntities(String(res?.data || ''));

      Swal.fire({
        title: t('auth.termsConditions'),
        html: `<div style="text-align:left;line-height:1.7;font-size:14px;max-height:60vh;overflow:auto;">${htmlContent}</div>`,
        confirmButtonText: 'OK',
        confirmButtonColor: '#000000',
        width: 800,
        customClass: {
          popup: 'rounded-[2rem]',
          confirmButton: 'rounded-xl px-10 py-3 font-bold',
        },
      });
    } catch (err) {
      console.error('Load Terms Error:', err);
      // Error modal is handled by api interceptor.
    }
  };

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!phone) {
      Swal.fire({
        text: t('auth.phoneNumberRequired'),
        icon: 'error',
        confirmButtonColor: '#000000',
        confirmButtonText: t('common.submit'),
      });
      return;
    }

    const normalizedPhone = `+${phone.replace(/\D/g, '')}`;
    if (!isValidPhoneNumber(normalizedPhone)) {
      Swal.fire({
        text: t('auth.phoneNumberInvalid'),
        icon: 'error',
        confirmButtonColor: '#000000',
        confirmButtonText: t('common.submit'),
      });
      return;
    }

    if (password !== confirmPassword) {
      Swal.fire({
        text: t('auth.passwordMismatch'),
        icon: 'error',
        confirmButtonColor: '#000000',
        confirmButtonText: t('common.submit'),
      });
      return;
    }

    setLoading(true);

    const data = qs.stringify({
      username,
      mobile: normalizedPhone,
      password,
      repassword: confirmPassword,
      paypwd: payPassword,
      sex,
      invite_code: inviteCode,
      email: '',
    });

    try {
      const res = await api.post('/login/reg', data);
      const token = res?.data?.token;

      if (token) {
        setAuth(res.data, token);
        navigate('/');
      }
    } catch (err) {
      console.error('Sign Up Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-8 pt-16 pb-10 flex flex-col items-center">
      <h1 className="text-[56px] font-bold mb-4 uppercase">{t('auth.signUpTitle')}</h1>
      <p className="text-gray-600 mb-10 text-center font-medium">
        {t('auth.authSubtitle')}
      </p>

      <form className="w-full space-y-4 mb-8" onSubmit={handleSignUp}>
        <AuthInput
          placeholder={t('auth.username')}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        
        <div className="w-full">
          <PhoneInput
            country="us"
            value={phone}
            onChange={(value) => setPhone(value)}
            isValid={(value, country) => {
              if (!value) return true;
              const dialCode = country?.dialCode || '';
              const digits = String(value).replace(/\D/g, '');
              if (!digits || !dialCode) return false;
              if (!digits.startsWith(dialCode)) return false;
              return isValidPhoneNumber(`+${digits}`);
            }}
            enableSearch
            placeholder={t('auth.phoneNumber')}
            containerClass="!w-full"
            inputClass="!w-full !h-[58px] !pl-18 !pr-6 !text-base !border !border-gray-200 !rounded-2xl !shadow-none focus:!ring-1 focus:!ring-black"
            buttonClass="!border-0 !bg-transparent !pl-4"
            dropdownClass="!max-h-72 !text-sm"
            countryCodeEditable={false}
          />
        </div>

        <AuthInput
          placeholder={t('auth.password')}
          isPassword
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <AuthInput
          placeholder={t('auth.confirmPassword')}
          isPassword
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <AuthInput
          placeholder={t('auth.payPassword')}
          isPassword
          value={payPassword}
          onChange={(e) => setPayPassword(e.target.value)}
          required
        />

        <div className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl flex items-center justify-between">
          <span className="text-gray-500">{t('auth.gender')}</span>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                className="w-5 h-5 accent-[#D1B18D]"
                checked={sex === '1'}
                onChange={() => setSex('1')}
              />
              <span className="font-medium">{t('auth.male')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                className="w-5 h-5 accent-[#D1B18D]"
                checked={sex === '2'}
                onChange={() => setSex('2')}
              />
              <span className="font-medium text-gray-500">{t('auth.female')}</span>
            </label>
          </div>
        </div>

        <AuthInput
          placeholder={t('auth.inviteCode')}
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
        />

        <div className="flex items-center gap-2 px-1">
          <input type="checkbox" className="w-5 h-5 accent-[#D1B18D]" defaultChecked />
          <p className="text-sm font-bold">
            {t('auth.acceptOurs')} <button type="button" onClick={handleShowTerms} className="text-[#D1B18D] underline">{t('auth.termsConditions')}</button>
          </p>
        </div>

        <div className="pt-4">
          <AuthButton type="submit" disabled={loading}>
            {loading ? '...' : t('common.submit')}
          </AuthButton>
        </div>
      </form>

      <div className="space-y-4 text-center">
        <p className="font-medium">
          {t('auth.alreadyHaveAccount')}{' '}
          <Link to="/signin" className="font-bold underline">
            {t('auth.signIn')}
          </Link>
        </p>
        <p className="text-sm font-medium">
          {t('auth.agreeToTerms')}{' '}
          <button type="button" onClick={handleShowTerms} className="font-bold underline">
            {t('auth.termsConditions')}
          </button>
        </p>
      </div>
    </div>
  );
}

