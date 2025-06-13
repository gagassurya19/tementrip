import React from 'react';
import { getButtonClasses } from '@/lib/utils/colors';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BrandButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const BrandButton = React.forwardRef<HTMLButtonElement, BrandButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    isLoading = false, 
    loadingText,
    className,
    disabled,
    children,
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-12 px-4',
      lg: 'h-14 px-6 text-lg',
    };

    const buttonClasses = cn(
      'w-full font-medium rounded-lg transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      getButtonClasses(variant),
      sizeClasses[size],
      className
    );

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {loadingText || 'Loading...'}
          </div>
        ) : (
          children
        )}
      </button>
    );
  }
);

BrandButton.displayName = 'BrandButton'; 