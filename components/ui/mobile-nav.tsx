'use client';

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  children: React.ReactNode;
  trigger?: React.ReactNode;
  className?: string;
}

export function MobileNav({ children, trigger, className }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  const defaultTrigger = (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden"
      aria-label="Abrir menú de navegación"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || defaultTrigger}
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className={cn("w-80 p-0", className)}
        aria-label="Menú de navegación móvil"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Navegación</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface MobileNavItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  className?: string;
}

export function MobileNavItem({ 
  children, 
  onClick, 
  active = false, 
  className 
}: MobileNavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center px-4 py-3 text-left text-sm font-medium transition-colors",
        "hover:bg-slate-100 focus:bg-slate-100 focus:outline-none",
        "focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-inset",
        active && "bg-orange-50 text-orange-700 border-r-2 border-orange-500",
        className
      )}
      aria-current={active ? 'page' : undefined}
    >
      {children}
    </button>
  );
}

interface MobileNavSectionProps {
  title: string;
  children: React.ReactNode;
}

export function MobileNavSection({ title, children }: MobileNavSectionProps) {
  return (
    <div className="py-2">
      <h3 className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {title}
      </h3>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}