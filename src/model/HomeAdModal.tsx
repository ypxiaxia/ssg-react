import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface HomeAdModalProps {
  open: boolean;
  imageSrc: string;
  onClose: () => void;
}

export default function HomeAdModal({ open, imageSrc, onClose }: HomeAdModalProps) {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] bg-black/60 px-6 flex items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t('home.adAlt')}
    >
      <div className="relative w-full max-w-[420px]" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.cancel')}
          className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-black text-white flex items-center justify-center shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>
        <img
          src={imageSrc}
          alt={t('home.adAlt')}
          className="w-full rounded-2xl shadow-2xl object-cover"
        />
      </div>
    </div>
  );
}
