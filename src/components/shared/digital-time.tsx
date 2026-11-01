import React from 'react';

interface DigitalTimeProps {
  formattedTime: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
  variant?: 'default' | 'warning' | 'urgent' | 'completed' | 'custom';
  customColor?: string;
  className?: string;
  isFlashing?: boolean;
}

export const DigitalTime: React.FC<DigitalTimeProps> = ({
  formattedTime,
  size = 'lg',
  variant = 'default',
  customColor,
  className = '',
  isFlashing = false,
}) => {
  const sizeClasses = {
    sm: 'text-xl font-semibold tracking-tight',
    md: 'text-3xl font-bold tracking-tight',
    lg: 'text-5xl font-extrabold tracking-tight',
    xl: 'text-7xl font-black tracking-tight',
    '2xl': 'text-8xl sm:text-9xl font-black tracking-tighter',
    hero: 'text-[12vw] sm:text-[14vw] font-black tracking-tighter leading-none',
  };

  const getVariantColor = () => {
    if (customColor) return '';
    switch (variant) {
      case 'warning':
        return 'text-amber-400';
      case 'urgent':
        return 'text-rose-500';
      case 'completed':
        return 'text-rose-500';
      case 'default':
      default:
        return 'text-white';
    }
  };

  return (
    <span
      style={customColor ? { color: customColor } : undefined}
      className={`font-mono tabular-nums select-none ${sizeClasses[size]} ${getVariantColor()} ${
        isFlashing ? 'animate-urgent-flash' : ''
      } ${className}`}
    >
      {formattedTime}
    </span>
  );
};
