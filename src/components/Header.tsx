import { User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logoImage from '../assets/logo.png';

export default function Header() {
  const { t } = useTranslation();

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 sticky top-0 z-50">
      <Link to="/" className="block">
        <img src={logoImage} alt="Dazze logo" className="h-7 w-auto" />
      </Link>
      <div className="flex items-center gap-4">
        <button className="px-5 py-1.5 border border-black rounded-full text-sm font-medium hover:bg-black hover:text-white transition-colors">
          <Link to="/contact">{t('common.contact')}</Link>
        </button>
        <Link to="/profile" className="p-1">
          <User className="w-6 h-6" />
        </Link>
      </div>
    </header>
  );
}

