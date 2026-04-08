'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';
import { ANIMATION_CLASSES } from '@/lib/utils/animations';

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
    variant?: 'default' | 'info' | 'warning' | 'error' | 'success';
    size?: 'sm' | 'md' | 'lg';
  }
>(({ className, sideOffset = 4, variant = 'default', size = 'md', ...props }, ref) => {
  const variantClasses = {
    default: 'bg-popover text-popover-foreground border',
    info: 'bg-blue-50 text-blue-900 border-blue-200',
    warning: 'bg-yellow-50 text-yellow-900 border-yellow-200',
    error: 'bg-red-50 text-red-900 border-red-200',
    success: 'bg-green-50 text-green-900 border-green-200',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs max-w-xs',
    md: 'px-3 py-2 text-sm max-w-sm',
    lg: 'px-4 py-3 text-base max-w-md',
  };

  return (
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 overflow-hidden rounded-md shadow-md',
        ANIMATION_CLASSES.dropIn,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
});
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

interface EnhancedTooltipProps {
  content: React.ReactNode;
  title?: string;
  variant?: 'default' | 'info' | 'warning' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  delayDuration?: number;
  children: React.ReactNode;
  disabled?: boolean;
  shortcut?: string;
}

/**
 * Enhanced tooltip component with better UX and accessibility
 */
export function EnhancedTooltip({
  content,
  title,
  variant = 'default',
  size = 'md',
  side = 'top',
  align = 'center',
  delayDuration = 300,
  children,
  disabled = false,
  shortcut,
}: EnhancedTooltipProps) {
  if (disabled) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          variant={variant}
          size={size}
        >
          <div className="space-y-1">
            {title && (
              <div className="font-semibold text-xs uppercase tracking-wide opacity-75">
                {title}
              </div>
            )}
            <div>{content}</div>
            {shortcut && (
              <div className="flex items-center justify-between pt-1 mt-2 border-t border-current/20">
                <span className="text-xs opacity-75">Atajo:</span>
                <kbd className="px-1.5 py-0.5 text-xs font-mono bg-black/10 rounded border">
                  {shortcut}
                </kbd>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Quick tooltip for simple text content
 */
export function QuickTooltip({
  text,
  children,
  ...props
}: {
  text: string;
  children: React.ReactNode;
} & Omit<EnhancedTooltipProps, 'content' | 'children'>) {
  return (
    <EnhancedTooltip content={text} {...props}>
      {children}
    </EnhancedTooltip>
  );
}

/**
 * Help tooltip with info icon
 */
export function HelpTooltip({
  content,
  className,
  ...props
}: {
  content: React.ReactNode;
  className?: string;
} & Omit<EnhancedTooltipProps, 'children'>) {
  return (
    <EnhancedTooltip content={content} variant="info" {...props}>
      <button
        type="button"
        className={cn(
          'inline-flex items-center justify-center w-4 h-4 rounded-full',
          'bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
          className
        )}
        aria-label="Ayuda"
      >
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>
    </EnhancedTooltip>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };