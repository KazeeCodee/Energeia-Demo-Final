'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Activity, 
  Search, 
  Eye, 
  User, 
  Building2, 
  FileText, 
  LogIn, 
  Download,
  Share2,
  Settings,
  Globe,
  Clock,
  MapPin
} from 'lucide-react';

interface SystemLog {
  id: string;
  timestamp: Date;
  activity: string;
  activityType: 'login' | 'download' | 'share' | 'create' | 'update' | 'view';
  user: {
    name: string;
    email: string;
    company: string;
  };
  details: {
    ip: string;
    country: string;
    city: string;
    browser: string;
    os: string;
    resource?: string;
    description: string;
  };
}

// Datos simulados de logs
const mockLogs: SystemLog[] = [
  {
    id: 'log-001',
    timestamp: new Date('2025-01-06T14:30:25'),
    activity: 'Descarga de informe energético',
    activityType: 'download',
    user: {
      name: 'María González',
      email: 'maria.gonzalez@santarita.com',
      company: 'Santa Rita Metalúrgica S.A.'
    },
    details: {
      ip: '192.168.1.45',
      country: 'Argentina',
      city: 'Buenos Aires',
      browser: 'Chrome 120.0',
      os: 'Windows 11',
      resource: 'informe_energetico_2024_12.pdf',
      description: 'Usuario descargó informe energético del período diciembre 2024'
    }
  },
  {
    id: 'log-002',
    timestamp: new Date('2025-01-06T14:15:12'),
    activity: 'Inicio de sesión exitoso',
    activityType: 'login',
    user: {
      name: 'Carlos Mendoza',
      email: 'carlos.mendoza@energeia.com',
      company: 'Energeia Backoffice'
    },
    details: {
      ip: '10.0.0.123',
      country: 'Argentina',
      city: 'Córdoba',
      browser: 'Firefox 121.0',
      os: 'macOS 14.2',
      description: 'Usuario de backoffice inició sesión en el sistema'
    }
  },
  {
    id: 'log-003',
    timestamp: new Date('2025-01-06T13:45:33'),
    activity: 'Enlace compartido creado',
    activityType: 'share',
    user: {
      name: 'Ana Rodríguez',
      email: 'ana.rodriguez@tecnoind.com',
      company: 'Tecnología Industrial Ltda.'
    },
    details: {
      ip: '172.16.0.89',
      country: 'Argentina',
      city: 'Rosario',
      browser: 'Safari 17.2',
      os: 'macOS 14.1',
      resource: 'dashboard_comparativo',
      description: 'Usuario creó enlace compartido para dashboard comparativo de consumo'
    }
  },
  {
    id: 'log-004',
    timestamp: new Date('2025-01-06T13:20:18'),
    activity: 'Nueva empresa registrada',
    activityType: 'create',
    user: {
      name: 'Roberto Silva',
      email: 'roberto.silva@energeia.com',
      company: 'Energeia Backoffice'
    },
    details: {
      ip: '10.0.0.156',
      country: 'Argentina',
      city: 'Buenos Aires',
      browser: 'Chrome 120.0',
      os: 'Windows 11',
      resource: 'Metalúrgica del Sur S.A.',
      description: 'Administrador registró nueva empresa en el sistema'
    }
  },
  {
    id: 'log-005',
    timestamp: new Date('2025-01-06T12:55:07'),
    activity: 'Visualización de informes',
    activityType: 'view',
    user: {
      name: 'Laura Fernández',
      email: 'laura.fernandez@industrialsa.com',
      company: 'Industrial S.A.'
    },
    details: {
      ip: '192.168.2.78',
      country: 'Argentina',
      city: 'Mendoza',
      browser: 'Edge 120.0',
      os: 'Windows 10',
      description: 'Usuario accedió a la sección de informes históricos'
    }
  },
  {
    id: 'log-006',
    timestamp: new Date('2025-01-06T12:30:44'),
    activity: 'Configuración actualizada',
    activityType: 'update',
    user: {
      name: 'Diego Morales',
      email: 'diego.morales@energeia.com',
      company: 'Energeia Backoffice'
    },
    details: {
      ip: '10.0.0.201',
      country: 'Argentina',
      city: 'Buenos Aires',
      browser: 'Chrome 120.0',
      os: 'Ubuntu 22.04',
      description: 'Administrador actualizó configuraciones del sistema'
    }
  }
];

export default function LogsPage() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SystemLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    // Simular carga de datos
    const loadLogs = async () => {
      setIsLoading(true);
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLogs(mockLogs);
      setFilteredLogs(mockLogs);
      setIsLoading(false);
    };

    loadLogs();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredLogs(logs);
      return;
    }

    const filtered = logs.filter(log =>
      log.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.country.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLogs(filtered);
  }, [logs, searchTerm]);

  const getActivityIcon = (type: SystemLog['activityType']) => {
    switch (type) {
      case 'login':
        return <LogIn className="h-4 w-4" />;
      case 'download':
        return <Download className="h-4 w-4" />;
      case 'share':
        return <Share2 className="h-4 w-4" />;
      case 'create':
        return <Building2 className="h-4 w-4" />;
      case 'update':
        return <Settings className="h-4 w-4" />;
      case 'view':
        return <Eye className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityBadgeColor = (type: SystemLog['activityType']) => {
    switch (type) {
      case 'login':
        return 'bg-green-100 text-green-800';
      case 'download':
        return 'bg-blue-100 text-blue-800';
      case 'share':
        return 'bg-purple-100 text-purple-800';
      case 'create':
        return 'bg-orange-100 text-orange-800';
      case 'update':
        return 'bg-yellow-100 text-yellow-800';
      case 'view':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const handleViewDetail = (log: SystemLog) => {
    setSelectedLog(log);
    setIsDetailModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
            <Activity className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Logs del Sistema</h1>
            <p className="text-slate-600">Cargando actividad del sistema...</p>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-slate-200 rounded"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
          <Activity className="h-5 w-5 text-orange-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Logs del Sistema</h1>
          <p className="text-slate-600">
            Monitoreo de actividad del sistema ({filteredLogs.length} registros)
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>
            Registro cronológico de todas las actividades del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por actividad, usuario, empresa o país..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha y Hora</TableHead>
                  <TableHead>Actividad</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead className="w-[100px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-mono">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getActivityIcon(log.activityType)}
                        <div>
                          <div className="font-medium">{log.activity}</div>
                          <Badge className={`text-xs ${getActivityBadgeColor(log.activityType)}`}>
                            {log.activityType}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <div>
                          <div className="font-medium">{log.user.name}</div>
                          <div className="text-sm text-slate-500">{log.user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-slate-400" />
                        <span className="text-sm">{log.user.company}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <div>
                          <div className="text-sm">{log.details.city}</div>
                          <div className="text-xs text-slate-500">{log.details.country}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetail(log)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredLogs.length === 0 && searchTerm && (
            <div className="text-center py-8 text-slate-500">
              No se encontraron logs que coincidan con la búsqueda
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalle del Log */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-600" />
              Detalle del Log
            </DialogTitle>
            <DialogDescription>
              Información completa de la actividad del sistema
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-6">
              {/* Información General */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600">ID del Log</label>
                  <p className="text-sm font-mono bg-slate-100 p-2 rounded">{selectedLog.id}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600">Fecha y Hora</label>
                  <p className="text-sm font-mono bg-slate-100 p-2 rounded">
                    {formatTimestamp(selectedLog.timestamp)}
                  </p>
                </div>
              </div>

              {/* Actividad */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Actividad</label>
                <div className="flex items-center gap-2 bg-slate-100 p-3 rounded">
                  {getActivityIcon(selectedLog.activityType)}
                  <span className="font-medium">{selectedLog.activity}</span>
                  <Badge className={`ml-auto ${getActivityBadgeColor(selectedLog.activityType)}`}>
                    {selectedLog.activityType}
                  </Badge>
                </div>
              </div>

              {/* Usuario */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-600">Información del Usuario</label>
                <div className="bg-slate-100 p-3 rounded space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-500" />
                    <span className="font-medium">{selectedLog.user.name}</span>
                  </div>
                  <div className="text-sm text-slate-600">{selectedLog.user.email}</div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">{selectedLog.user.company}</span>
                  </div>
                </div>
              </div>

              {/* Detalles Técnicos */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-600">Detalles Técnicos</label>
                <div className="bg-slate-100 p-3 rounded space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">IP:</span> {selectedLog.details.ip}
                    </div>
                    <div>
                      <span className="font-medium">Navegador:</span> {selectedLog.details.browser}
                    </div>
                    <div>
                      <span className="font-medium">SO:</span> {selectedLog.details.os}
                    </div>
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      <span className="font-medium">Ubicación:</span> {selectedLog.details.city}, {selectedLog.details.country}
                    </div>
                  </div>
                  {selectedLog.details.resource && (
                    <div className="pt-2 border-t border-slate-200">
                      <span className="font-medium">Recurso:</span> {selectedLog.details.resource}
                    </div>
                  )}
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Descripción</label>
                <p className="text-sm bg-slate-100 p-3 rounded">{selectedLog.details.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}