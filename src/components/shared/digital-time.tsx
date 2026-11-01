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
    sm: 'text-lg font-normal tracking-tight',
    md: 'text-2xl font-normal tracking-tight',
    lg: 'text-4xl font-normal tracking-tight',
    xl: 'text-6xl font-light tracking-tight',
    '2xl': 'text-8xl sm:text-9xl font-light tracking-tighter',
    hero: 'text-[14vw] sm:text-[16vw] font-light tracking-tighter leading-none',
  };

  const getVariantColor = () => {
    if (customColor) return '';
    switch (variant) {
      case 'warning':
        return 'text-amber-400';
      case 'urgent':
        return 'text-red-400';
      case 'completed':
        return 'text-red-400';
      case 'default':
      default:
        return 'text-zinc-100';
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
