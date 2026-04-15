import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  isPassword?: boolean;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

export default function AuthInput({ label, icon, isPassword, className, type, ...props }: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full">
      <div className="relative flex items-center">
        {icon && <div className="absolute left-4">{icon}</div>}
        <input
          {...props}
          type={isPassword ? (showPassword ? 'text' : 'password') : (type || 'text')}
          className={`w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-1 focus:ring-black transition-all ${
            icon ? 'pl-12' : ''
          } ${isPassword ? 'pr-12' : ''} ${className || ''}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 text-gray-400 hover:text-black"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  );
}

