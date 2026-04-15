import React from 'react';
import { motion } from 'motion/react';

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export default function AuthButton({ children, variant = 'primary', className, ...props }: AuthButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      {...props}
      className={`w-full py-4 rounded-2xl font-bold text-2xl transition-all ${
        variant === 'primary'
          ? 'bg-black text-white hover:bg-gray-900'
          : 'bg-white text-black border border-gray-200 hover:bg-gray-50'
      } ${className || ''}`}
    >
      {children}
    </motion.button>
  );
}

