'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DashboardOverview } from '@/components/backoffice/dashboard-overview';
import { FileUpload } from '@/components/backoffice/file-upload';
import { LocalStorageManager } from '@/lib/utils/localStorage';
import { ProcessingStatus } from '@/components/backoffice/processing-status';
import { ProcessingModal } from '@/components/backoffice/processing-modal';
import { ProcessingJob } from '@/lib/types';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export default function BackofficeDashboardPage() {
  const _router = useRouter();
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [currentFile, setCurrentFile] = useState<UploadedFile | null>(null);
  const fileUploadRef = useRef<HTMLInputElement>(null);

  const handleFileProcessed = (file: UploadedFile) => {
    setCurrentFile(file);
    setShowProcessingModal(true);
  };

  const handleProcessingComplete = (result: ProcessingJob['result']) => {
    if (!result || !currentFile) return;
    toast.success('Procesamiento completado', {
      description: `Se generaron ${result.reportsGenerated} informes para ${result.companiesProcessed} empresas`,
    });
    // Agregar el archivo procesado a la lista de jobs en localStorage
    const now = new Date();
    const newJob: ProcessingJob = {
      id: `job-${now.getTime()}`,
      fileName: currentFile.name,
      fileSize: currentFile.size,
      status: 'completed' as const,
      steps: [
        { name: 'Extrayendo datos', status: 'completed', duration: 1000 },
        { name: 'Mapeando información', status: 'completed', duration: 1000 },
        { name: 'Generando informes', status: 'completed', duration: 1000 },
        { name: 'Render PDF', status: 'completed', duration: 1000 },
        { name: 'Publicando', status: 'completed', duration: 1000 },
      ],
      currentStep: 4,
      startedAt: now,
      completedAt: now,
      result: result,
    };
    let mockData = LocalStorageManager.getMockData();
    if (!mockData || typeof mockData !== 'object') mockData = {};
    const dataObj = mockData as Record<string, unknown> & { processingJobs?: ProcessingJob[] };
    if (!('processingJobs' in dataObj) || !Array.isArray(dataObj.processingJobs)) {
      dataObj.processingJobs = [];
    }
    dataObj.processingJobs = [newJob, ...dataObj.processingJobs];
    LocalStorageManager.setMockData(dataObj);
    if (fileUploadRef.current) {
      fileUploadRef.current.value = '';
    }
    setCurrentFile(null);
  };

  const handleCloseProcessingModal = () => {
    setShowProcessingModal(false);
    setCurrentFile(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600">
            Gestión y monitoreo del sistema de informes energéticos
          </p>
        </div>
        <Button 
          onClick={() => document.getElementById('cta-upload')?.scrollIntoView({ behavior: 'smooth' })}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Subir Archivo Mensual
        </Button>
      </div>

      {/* Dashboard Overview Cards */}
      <DashboardOverview />

      {/* File Upload Section */}
      <div id="cta-upload">
        <FileUpload ref={fileUploadRef} onFileProcessed={handleFileProcessed} />
      </div>

      {/* Processing Status */}
      <ProcessingStatus />

      {/* Processing Modal */}
      <ProcessingModal
        isOpen={showProcessingModal}
        onClose={handleCloseProcessingModal}
        fileName={currentFile?.name || ''}
        onComplete={handleProcessingComplete}
      />
    </div>
  );
}