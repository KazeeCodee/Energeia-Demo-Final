'use client';

import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Download, Share2, FileText, FileSpreadsheet } from 'lucide-react';
import { usePersistence } from '@/lib/hooks/use-persistence';
import { LocalStorageManager } from '@/lib/utils/localStorage';

interface ReportActionsProps {
  onDownload: (format: 'pdf' | 'csv') => void;
  onShare: () => void;
  disabled?: boolean;
}

export function ReportActions({ 
  onDownload, 
  onShare, 
  disabled = false 
}: ReportActionsProps) {
  const { trackActivity } = usePersistence();

  const handleDownload = (format: 'pdf' | 'csv') => {
    // Track download activity
    trackActivity('download_initiated', {
      format,
      timestamp: new Date(),
      page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
    });

    // Add to download history
    LocalStorageManager.addDownloadToHistory({
      format,
      fileName: `informe_${new Date().toISOString().slice(0, 10)}.${format}`,
      size: format === 'pdf' ? '2.5 MB' : '150 KB',
      status: 'completed',
    });

    // Call the original handler
    onDownload(format);
  };

  const handleShare = () => {
    // Track share activity
    trackActivity('link_shared', {
      action: 'share_initiated',
      timestamp: new Date(),
      page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
    });

    // Call the original handler
    onShare();
  };

  return (
    <div className="flex items-center space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={disabled}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Descargar</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={() => handleDownload('pdf')}
            className="flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>Descargar PDF</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleDownload('csv')}
            className="flex items-center space-x-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Descargar CSV</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleShare}
        disabled={disabled}
        className="flex items-center space-x-2"
      >
        <Share2 className="h-4 w-4" />
        <span>Compartir</span>
      </Button>
    </div>
  );
}