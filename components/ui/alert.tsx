'use client';

import React from 'react';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className = '', variant = 'default', children, ...props }, ref) => {
    const baseClasses = 'relative w-full rounded-lg border p-4';
    const variantClasses = {
      default: 'bg-white border-gray-200 text-gray-900',
      destructive: 'bg-red-50 border-red-200 text-red-900'
    };
    
    const classes = `${baseClasses} ${variantClasses[variant]} ${className}`.trim();

    return (
      <div
        ref={ref}
        role="alert"
        className={classes}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Alert.displayName = 'Alert';

export const AlertTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className = '', children, ...props }, ref) => (
  <h5
    ref={ref}
    className={`mb-1 font-medium leading-none tracking-tight ${className}`.trim()}
    {...props}
  >
    {children}
  </h5>
));

AlertTitle.displayName = 'AlertTitle';

export const AlertDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = '', children, ...props }, ref) => (
  <div
    ref={ref}
    className={`text-sm ${className}`.trim()}
    {...props}
  >
    {children}
  </div>
));

AlertDescription.displayName = 'AlertDescription';