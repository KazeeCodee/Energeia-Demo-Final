'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/state/auth';
import { useUIStore } from '@/lib/state/ui';
import { getMockData } from '@/lib/mock/data/seeds';
import { SimulationService } from '@/lib/services/simulation';

export function AuthInitializer() {
  const { initializeAuth } = useAuthStore();
  const { initializeUI } = useUIStore();

  useEffect(() => {
    // Initialize simulation service
    SimulationService.initialize();
    
    // Initialize mock data if needed
    getMockData();
    
    // Initialize auth state from localStorage
    initializeAuth();
    
    // Initialize UI state from localStorage
    initializeUI();
  }, [initializeAuth, initializeUI]);

  return null;
}