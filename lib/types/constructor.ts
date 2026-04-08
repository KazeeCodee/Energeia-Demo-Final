// Constructor de Informes Types

export interface ReportConfig {
  id: string;
  name: string;
  clientId?: string; // undefined para informe global
  spaces: GridSpace[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface GridSpace {
  id: string;
  columns: 1 | 2 | 3;
  components: ChartComponent[];
  order: number;
}

export interface ChartComponent {
  id: string;
  type: ChartComponentType;
  columnIndex: number;
  order?: number;
  config: ChartConfig;
  dataSource: DataSource;
}

export type ChartComponentType =
  | 'generation-mix'
  | 'demand-trend'
  | 'cost-comparison'
  | 'multi-series'
  | 'custom-bar'
  | 'custom-line'
  | 'custom-pie'
  // Gráficos del informe energético real
  | 'kpi-card'
  | 'demanda-anual'
  | 'costos-mem-linea'
  | 'donut-guma'
  | 'donut-gume'
  | 'renovable-bar'
  | 'costos-abastecimiento'
  | 'argentina-map';

export interface ChartConfig {
  title?: string;
  subtitle?: string;
  height: number;
  colors: string[];
  showLegend: boolean;
  showTooltip: boolean;
  customOptions?: Record<string, unknown>;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'energy-generation' | 'demand' | 'cost' | 'efficiency' | 'custom';
  fields: DataField[];
  sampleData: Record<string, unknown>[];
}

export interface DataField {
  id: string;
  name: string;
  type: 'number' | 'string' | 'date' | 'percentage';
  required: boolean;
  description?: string;
}

export interface GridPosition {
  spaceId: string;
  columnIndex: number;
}

export interface ValidationError {
  type: 'canvas' | 'component' | 'data' | 'grid';
  message: string;
  componentId?: string;
  spaceId?: string;
}

// Component Props Interfaces
export interface ReportBuilderProps {
  clientId?: string; // undefined para informe global
  onSave: (config: ReportConfig) => void;
  initialConfig?: ReportConfig;
}

export interface DesignCanvasProps {
  config: ReportConfig;
  onConfigChange: (config: ReportConfig) => void;
  onDropComponent: (component: ChartComponent, position: GridPosition) => void;
}

export interface ComponentPaletteProps {
  availableComponents: ChartComponentType[];
  onDragStart: (component: ChartComponentType) => void;
}

export interface GridSpaceProps {
  columns: 1 | 2 | 3;
  components: ChartComponent[];
  onComponentDrop: (component: ChartComponent, columnIndex: number) => void;
  onComponentRemove: (componentId: string) => void;
}

export interface ChartComponentConfigProps {
  component: ChartComponent;
  availableDataSources: DataSource[];
  onConfigChange: (config: ChartConfig) => void;
}