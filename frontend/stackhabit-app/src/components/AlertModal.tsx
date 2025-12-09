import React from 'react';

interface AlertModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
  variant?: 'success' | 'error' | 'warning' | 'info';
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  title,
  message,
  buttonText = 'OK',
  onClose,
  variant = 'info',
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    success: {
      icon: '✓',
      iconBg: 'bg-green-500',
      titleColor: 'text-green-400',
      borderColor: 'border-green-700',
    },
    error: {
      icon: '✕',
      iconBg: 'bg-red-500',
      titleColor: 'text-red-400',
      borderColor: 'border-red-700',
    },
    warning: {
      icon: '⚠',
      iconBg: 'bg-yellow-500',
      titleColor: 'text-yellow-400',
      borderColor: 'border-yellow-700',
    },
    info: {
      icon: 'ℹ',
      iconBg: 'bg-blue-500',
      titleColor: 'text-blue-400',
      borderColor: 'border-blue-700',
    },
  };

  const style = variantStyles[variant];
  const displayTitle = title || (variant === 'success' ? 'Sucesso' : variant === 'error' ? 'Erro' : variant === 'warning' ? 'Aviso' : 'Informação');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className={`bg-black border ${style.borderColor} rounded-lg max-w-md w-full p-6`}>
        <div className="flex items-start gap-4 mb-4">
          <div className={`${style.iconBg} w-10 h-10 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0`}>
            {style.icon}
          </div>
          <div className="flex-1">
            <h2 className={`text-xl font-bold ${style.titleColor} mb-2`}>{displayTitle}</h2>
            <p className="text-gray-300 whitespace-pre-wrap">{message}</p>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white text-black rounded-md hover:bg-gray-200 transition-colors"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

