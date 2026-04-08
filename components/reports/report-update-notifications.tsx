'use client';

import { useEffect, useState } from 'react';
import { ReportSyncService, SyncNotification } from '@/lib/services/report-sync';
import { useAuthStore } from '@/lib/state/auth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  RefreshCw, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info 
} from 'lucide-react';
import { toast } from 'sonner';

interface ReportUpdateNotificationsProps {
  clientId?: string;
  onUpdateAvailable?: () => void;
}

export function ReportUpdateNotifications({ 
  clientId, 
  onUpdateAvailable 
}: ReportUpdateNotificationsProps) {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<SyncNotification[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [hasUpdates, setHasUpdates] = useState(false);

  useEffect(() => {
    const listenerId = `notifications-${clientId || 'global'}-${Date.now()}`;
    
    const handleSyncNotification = (notification: SyncNotification) => {
      // Check if this notification affects our context
      const affectsUs = 
        (!clientId && !notification.clientId) || // Both global
        (clientId === notification.clientId) || // Same client
        (!notification.clientId && clientId); // Global update affects client (fallback)
      
      if (affectsUs) {
        setNotifications(prev => {
          // Avoid duplicates
          const exists = prev.some(n => 
            n.configId === notification.configId && 
            n.type === notification.type &&
            Math.abs(n.timestamp.getTime() - notification.timestamp.getTime()) < 1000
          );
          
          if (exists) return prev;
          
          // Keep only last 5 notifications
          const updated = [notification, ...prev].slice(0, 5);
          return updated;
        });
        
        setHasUpdates(true);
        setIsVisible(true);
        onUpdateAvailable?.();
      }
    };

    // Register sync listener
    ReportSyncService.addListener(listenerId, handleSyncNotification);
    
    return () => {
      ReportSyncService.removeListener(listenerId);
    };
  }, [clientId, onUpdateAvailable]);

  // Auto-hide notifications after 10 seconds
  useEffect(() => {
    if (isVisible && notifications.length > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, notifications.length]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setHasUpdates(false);
    setNotifications([]);
  };

  const handleMarkAsRead = () => {
    setHasUpdates(false);
  };

  const getNotificationIcon = (type: SyncNotification['type']) => {
    switch (type) {
      case 'config_created':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'config_updated':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'config_deleted':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationVariant = (type: SyncNotification['type']) => {
    switch (type) {
      case 'config_created':
        return 'default';
      case 'config_updated':
        return 'default';
      case 'config_deleted':
        return 'destructive';
      default:
        return 'default';
    }
  };

  // Don't show notifications on constructor page (user is already aware)
  if (typeof window !== 'undefined' && window.location.pathname.includes('/constructor-informes')) {
    return null;
  }

  // Don't show if no notifications
  if (notifications.length === 0) {
    return null;
  }

  return (
    <>
      {/* Floating notification indicator */}
      {hasUpdates && !isVisible && (
        <div className="fixed top-4 right-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsVisible(true)}
            className="bg-white shadow-lg border-orange-200 hover:border-orange-300"
          >
            <Bell className="h-4 w-4 mr-2 text-orange-500" />
            Actualizaciones disponibles
            <Badge variant="secondary" className="ml-2">
              {notifications.length}
            </Badge>
          </Button>
        </div>
      )}

      {/* Notification panel */}
      {isVisible && (
        <div className="fixed top-4 right-4 z-50 w-96 max-w-[90vw]">
          <Alert className="bg-white shadow-lg border-orange-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-orange-500" />
                <span className="font-medium">Actualizaciones de Informes</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <AlertDescription className="mt-3">
              <div className="space-y-2">
                {notifications.slice(0, 3).map((notification, index) => (
                  <div 
                    key={`${notification.configId}-${notification.timestamp.getTime()}`}
                    className="flex items-start space-x-2 p-2 rounded-md bg-gray-50"
                  >
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {notification.timestamp.toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                
                {notifications.length > 3 && (
                  <p className="text-xs text-gray-500 text-center">
                    +{notifications.length - 3} actualizaciones más
                  </p>
                )}
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAsRead}
                  className="text-xs"
                >
                  Marcar como leído
                </Button>
                <Button
                  size="sm"
                  onClick={handleRefresh}
                  className="flex items-center space-x-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Actualizar</span>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </>
  );
}

// Hook for using notifications in components
export function useReportUpdateNotifications(clientId?: string) {
  const [hasUpdates, setHasUpdates] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const listenerId = `hook-${clientId || 'global'}-${Date.now()}`;
    
    const handleSyncNotification = (notification: SyncNotification) => {
      const affectsUs = 
        (!clientId && !notification.clientId) || 
        (clientId === notification.clientId) ||
        (!notification.clientId && clientId);
      
      if (affectsUs) {
        setHasUpdates(true);
        setLastUpdate(notification.timestamp);
      }
    };

    ReportSyncService.addListener(listenerId, handleSyncNotification);
    
    return () => {
      ReportSyncService.removeListener(listenerId);
    };
  }, [clientId]);

  const markAsRead = () => {
    setHasUpdates(false);
  };

  const forceRefresh = () => {
    ReportSyncService.forceRefresh();
    setHasUpdates(false);
  };

  return {
    hasUpdates,
    lastUpdate,
    markAsRead,
    forceRefresh,
  };
}