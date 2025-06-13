import React from 'react';
import { cn } from '@/lib/utils';
import { getBrandBackgroundClasses } from '@/lib/utils/colors';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  background?: 'default' | 'light' | 'lighter' | 'white';
  withPadding?: boolean;
  fullHeight?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className,
  background = 'default',
  withPadding = true,
  fullHeight = true,
}) => {
  const backgroundClasses = {
    default: getBrandBackgroundClasses('default'),
    light: getBrandBackgroundClasses('light'),
    lighter: getBrandBackgroundClasses('lighter'),
    white: 'bg-white',
  };

  return (
    <div
      className={cn(
        backgroundClasses[background],
        fullHeight && 'min-h-screen',
        withPadding && 'p-4 md:p-6 lg:p-8',
        className
      )}
    >
      {children}
    </div>
  );
};

// Shorthand components untuk common patterns
export const DefaultPageContainer: React.FC<Omit<PageContainerProps, 'background'>> = (props) => (
  <PageContainer {...props} background="default" />
);

export const LightPageContainer: React.FC<Omit<PageContainerProps, 'background'>> = (props) => (
  <PageContainer {...props} background="light" />
);

export const WhitePageContainer: React.FC<Omit<PageContainerProps, 'background'>> = (props) => (
  <PageContainer {...props} background="white" />
); 