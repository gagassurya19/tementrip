import React from 'react';
import Link, { LinkProps } from 'next/link';
import { getBrandLinkClasses } from '@/lib/utils/colors';
import { cn } from '@/lib/utils';

interface BrandLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
}

export const BrandLink = React.forwardRef<HTMLAnchorElement, BrandLinkProps>(
  ({ children, className, variant = 'default', size = 'md', ...props }, ref) => {
    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    };

    const variantClasses = {
      default: getBrandLinkClasses(),
      subtle: 'text-brand-primary/80 hover:text-brand-primary hover:underline transition-colors duration-200',
    };

    const linkClasses = cn(
      'font-medium',
      sizeClasses[size],
      variantClasses[variant],
      className
    );

    return (
      <Link
        ref={ref}
        className={linkClasses}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

BrandLink.displayName = 'BrandLink'; 