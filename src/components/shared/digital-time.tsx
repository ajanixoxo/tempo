import React from 'react';

interface DigitalTimeProps {
  formattedTime: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
  variant?: 'default' | 'warning' | 'urgent' | 'completed' | 'custom';
  customColor?: string;
  className?: string;
  isFlashing?: boolean;
  scale?: number; // e.g. 100 for 100%, 150 for 150%, 200 for 200%, up to any size
  customFontSize?: string;
}

export const DigitalTime: React.FC<DigitalTimeProps> = ({
  formattedTime,
  size = 'lg',
  variant = 'default',
  customColor,
  className = '',
  isFlashing = false,
  scale = 100,
  customFontSize,
}) => {
  const sizeClasses = {
    sm: 'text-lg font-normal tracking-tight',
    md: 'text-2xl font-normal tracking-tight',
    lg: 'text-4xl font-normal tracking-tight',
    xl: 'text-6xl font-light tracking-tight',
    '2xl': 'text-8xl sm:text-9xl font-light tracking-tighter',
    hero: 'font-light tracking-tighter leading-none whitespace-nowrap',
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

  // Compute dynamic font size for hero stage display or when custom scale/size is requested
  const computedStyle: React.CSSProperties = {};
  if (customColor) {
    computedStyle.color = customColor;
  }

  if (customFontSize) {
    computedStyle.fontSize = customFontSize;
    computedStyle.lineHeight = '0.95';
    computedStyle.whiteSpace = 'nowrap';
  } else if (size === 'hero') {
    // Dynamic viewport-relative size that multiplies with user scale
    // At 100%, base is 18vw; at 150% it is 27vw; at 200% it is 36vw, etc.
    const multiplier = Math.max(0.3, scale / 100);
    const vwSize = (18 * multiplier).toFixed(2);
    computedStyle.fontSize = `clamp(3rem, ${vwSize}vw, 70vh)`;
    computedStyle.lineHeight = '0.95';
    computedStyle.whiteSpace = 'nowrap';
  }

  return (
    <span
      style={computedStyle}
      className={`font-mono tabular-nums select-none inline-block ${
        sizeClasses[size]
      } ${getVariantColor()} ${isFlashing ? 'animate-urgent-flash' : ''} ${className}`}
    >
      {formattedTime}
    </span>
  );
};
