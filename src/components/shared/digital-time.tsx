import React from 'react';

export type FontWeightOption = 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';

interface DigitalTimeProps {
  formattedTime: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
  variant?: 'default' | 'warning' | 'urgent' | 'completed' | 'custom';
  customColor?: string;
  className?: string;
  isFlashing?: boolean;
  scale?: number; // e.g. 100 for 100%, 150 for 150%, 200 for 200%, up to any size
  customFontSize?: string;
  weight?: FontWeightOption;
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
  weight = 'bold',
}) => {
  const sizeClasses = {
    sm: 'text-lg tracking-tight',
    md: 'text-2xl tracking-tight',
    lg: 'text-4xl tracking-tight',
    xl: 'text-6xl tracking-tight',
    '2xl': 'text-8xl sm:text-9xl tracking-tight',
    hero: 'tracking-tight leading-none whitespace-nowrap',
  };

  const weightClasses: Record<FontWeightOption, string> = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
    black: 'font-black',
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
    // Dynamic viewport-relative size calibrated to fill ~88-90% of screen width by default (matching Stagetimer display)
    const multiplier = Math.max(0.3, scale / 100);
    const len = formattedTime.length;
    let baseVw = 28;
    if (len <= 5) {
      baseVw = 28; // e.g. "10:00" -> 28vw fills ~88-90% of screen width
    } else if (len === 6) {
      baseVw = 24.5; // e.g. "+00:20"
    } else if (len <= 8) {
      baseVw = 18.5; // e.g. "01:00:00"
    } else {
      baseVw = 16; // e.g. "+01:00:20"
    }
    const vwSize = (baseVw * multiplier).toFixed(2);
    computedStyle.fontSize = `clamp(4rem, ${vwSize}vw, 75vh)`;
    computedStyle.lineHeight = '0.92';
    computedStyle.whiteSpace = 'nowrap';
  }

  const hasCustomFontFamily =
    className.includes('font-sans') ||
    className.includes('font-serif') ||
    className.includes('font-condensed') ||
    className.includes('font-impact');

  return (
    <span
      style={computedStyle}
      className={`${hasCustomFontFamily ? '' : 'font-mono'} ${
        weightClasses[weight]
      } tabular-nums select-none inline-block ${
        sizeClasses[size]
      } ${getVariantColor()} ${isFlashing ? 'animate-urgent-flash' : ''} ${className}`}
    >
      {formattedTime}
    </span>
  );
};
