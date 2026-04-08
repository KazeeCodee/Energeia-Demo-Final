'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { ReportConfig } from '@/lib/types/constructor';
import { PreviewReport } from '@/components/preview/preview-report';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Share2, Printer } from 'lucide-react';

function PreviewInformeContent() {
  const searchParams = useSearchParams();
  const [config, setConfig] = useState<ReportConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const configParam = searchParams.get('config');
    if (configParam) {
      try {
        const decodedConfig = JSON.parse(decodeURIComponent(configParam));
        setConfig(decodedConfig);
      } catch (error) {
        console.error('Error parsing config:', error);
      }
    }
    setLoading(false);
  }, [searchParams]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Simulate PDF download
    alert('En la versión completa, aquí se descargaría el informe en PDF');
  };

  const handleShare = () => {
    // Simulate sharing
    alert('En la versión completa, aquí se compartiría el informe');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando vista previa...</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">No se pudo cargar la configuración del informe</p>
          <Button onClick={() => window.close()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cerrar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 print-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.close()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cerrar Vista Previa
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-lg font-semibold text-gray-900">
                Vista Previa: {config.name}
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Compartir
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Descargar PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PreviewReport config={config} />
      </main>

      {/* Demo watermark */}
      <div className="fixed bottom-4 right-4 bg-orange-500 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg print-hidden">
        🚀 DEMO - Sistema Energeia
      </div>
    </div>
  );
}

export default function PreviewInformePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando vista previa...</p>
        </div>
      </div>
    }>
      <PreviewInformeContent />
    </Suspense>
  );
}