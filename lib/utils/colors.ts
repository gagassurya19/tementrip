import { BRAND_COLORS, TAILWIND_CLASSES } from '@/lib/constants/colors';
import { clsx, type ClassValue } from 'clsx';

/**
 * Utility functions untuk mengelola warna TemanTrip
 */

// Generate class names untuk komponen button
export const getButtonClasses = (
  variant: 'primary' | 'secondary' = 'primary',
  additionalClasses?: string
) => {
  const baseClasses = 'transition-colors duration-200';
  
  const variantClasses = {
    primary: TAILWIND_CLASSES.BUTTON_PRIMARY,
    secondary: TAILWIND_CLASSES.BUTTON_SECONDARY,
  };

  return clsx(baseClasses, variantClasses[variant], additionalClasses);
};

// Generate class names untuk text brand
export const getBrandTextClasses = (
  size: 'sm' | 'md' | 'lg' | 'xl' = 'md',
  additionalClasses?: string
) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  return clsx(
    TAILWIND_CLASSES.TEXT_BRAND,
    'font-semibold',
    sizeClasses[size],
    additionalClasses
  );
};

// Generate class names untuk link brand
export const getBrandLinkClasses = (additionalClasses?: string) => {
  return clsx(TAILWIND_CLASSES.LINK_BRAND, 'transition-colors duration-200', additionalClasses);
};

// Generate class names untuk background sections
export const getBrandBackgroundClasses = (
  variant: 'default' | 'light' | 'lighter' = 'default',
  additionalClasses?: string
) => {
  const variantClasses = {
    default: TAILWIND_CLASSES.BG_BRAND_DEFAULT,
    light: TAILWIND_CLASSES.BG_BRAND_LIGHT,
    lighter: TAILWIND_CLASSES.BG_BRAND_LIGHTER,
  };

  return clsx(variantClasses[variant], additionalClasses);
};

// Get hex color values
export const getBrandColor = (colorKey: keyof typeof BRAND_COLORS) => {
  return BRAND_COLORS[colorKey];
};

// Validate if a hex color matches brand colors
export const isBrandColor = (hexColor: string): boolean => {
  return Object.values(BRAND_COLORS).includes(hexColor as any);
};

// Convert brand color to CSS custom property format
export const getBrandColorCSSVar = (colorKey: keyof typeof BRAND_COLORS) => {
  return `var(--brand-${colorKey.toLowerCase().replace('_', '-')})`;
};

/**
 * Compose utility for creating consistent component styles
 */
export const composeStyles = (...classNames: ClassValue[]) => {
  return clsx(classNames);
};

/**
 * Theme variants untuk komponen yang konsisten
 */
export const themeVariants = {
  button: {
    primary: getButtonClasses('primary'),
    secondary: getButtonClasses('secondary'),
  },
  text: {
    brand: getBrandTextClasses(),
    brandLarge: getBrandTextClasses('lg'),
    brandSmall: getBrandTextClasses('sm'),
  },
  background: {
    default: getBrandBackgroundClasses('default'),
    light: getBrandBackgroundClasses('light'),
    lighter: getBrandBackgroundClasses('lighter'),
  },
  link: {
    brand: getBrandLinkClasses(),
  },
} as const; 