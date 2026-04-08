import { describe, it, expect, beforeEach } from 'vitest';
import { ReportValidationService } from '../validation';
import { ReportConfig, GridSpace, ChartComponent, DataSource, ValidationError } from '../../types/constructor';

describe('ReportValidationService', () => {
  let mockDataSources: DataSource[];
  let validConfig: ReportConfig;
  let validComponent: ChartComponent;
  let validSpace: GridSpace;

  beforeEach(() => {
    // Setup mock data sources
    mockDataSources = [
      {
        id: 'energy-generation',
        name: 'Generación de Energía',
        type: 'energy-generation',
        fields: [
          { id: 'thermal', name: 'Térmica', type: 'percentage', required: true },
          { id: 'hydraulic', name: 'Hidráulica', type: 'percentage', required: true },
          { id: 'nuclear', name: 'Nuclear', type: 'percentage', required: true },
          { id: 'renewable', name: 'Renovable', type: 'percentage', required: true },
        ],
        sampleData: [{ thermal: 45, hydraulic: 25, nuclear: 15, renewable: 15 }]
      },
      {
        id: 'demand-trend',
        name: 'Tendencia de Demanda',
        type: 'demand',
        fields: [
          { id: 'month', name: 'Mes', type: 'string', required: true },
          { id: 'demand', name: 'Demanda (MWh)', type: 'number', required: true },
        ],
        sampleData: [
          { month: 'Ene', demand: 1200 },
          { month: 'Feb', demand: 1150 },
        ]
      },
      {
        id: 'custom-data',
        name: 'Datos Personalizados',
        type: 'custom',
        fields: [
          { id: 'category', name: 'Categoría', type: 'string', required: true },
          { id: 'value', name: 'Valor', type: 'number', required: true },
        ],
        sampleData: [{ category: 'Test', value: 100 }]
      }
    ];

    // Setup valid component
    validComponent = {
      id: 'component-1',
      type: 'generation-mix',
      columnIndex: 0,
      config: {
        title: 'Test Chart',
        subtitle: 'Test Subtitle',
        height: 300,
        colors: ['#FF7A00', '#00A3FF'],
        showLegend: true,
        showTooltip: true,
      },
      dataSource: mockDataSources[0],
    };

    // Setup valid space
    validSpace = {
      id: 'space-1',
      columns: 2,
      components: [validComponent],
      order: 0,
    };

    // Setup valid config
    validConfig = {
      id: 'config-1',
      name: 'Test Configuration',
      clientId: 'test-client',
      spaces: [validSpace],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };
  });

  describe('validateConfig', () => {
    it('should validate a correct configuration', () => {
      const result = ReportValidationService.validateConfig(validConfig, mockDataSources);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should reject configuration without ID', () => {
      const invalidConfig = { ...validConfig, id: '' };
      const result = ReportValidationService.validateConfig(invalidConfig, mockDataSources);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: 'canvas',
          message: 'La configuración debe tener un ID válido'
        })
      );
    });

    it('should reject configuration without name', () => {
      const invalidConfig = { ...validConfig, name: '' };
      const result = ReportValidationService.validateConfig(invalidConfig, mockDataSources);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: 'canvas',
          message: 'La configuración debe tener un nombre válido'
        })
      );
    });

    it('should reject configuration without components', () => {
      const invalidConfig = {
        ...validConfig,
        spaces: [{
          ...validSpace,
          components: []
        }]
      };
      const result = ReportValidationService.validateConfig(invalidConfig, mockDataSources);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: 'canvas',
          message: 'El informe debe tener al menos un componente para ser válido'
        })
      );
    });

    it('should reject configuration with duplicate space IDs', () => {
      const invalidConfig = {
        ...validConfig,
        spaces: [validSpace, { ...validSpace, id: validSpace.id }]
      };
      const result = ReportValidationService.validateConfig(invalidConfig, mockDataSources);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: 'canvas',
          message: expect.stringContaining('Hay espacios con IDs duplicados')
        })
      );
    });

    it('should reject configuration with duplicate component IDs', () => {
      const duplicateComponent = { ...validComponent, id: validComponent.id };
      const invalidConfig = {
        ...validConfig,
        spaces: [{
          ...validSpace,
          components: [validComponent, duplicateComponent]
        }]
      };
      const result = ReportValidationService.validateConfig(invalidConfig, mockDataSources);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: 'canvas',
          message: expect.stringContaining('Hay componentes con IDs duplicados')
        })
      );
    });
  });

  describe('validateGridSpace', () => {
    it('should validate a correct grid space', () => {
      const errors = ReportValidationService.validateGridSpace(validSpace);
      expect(errors).toHaveLength(0);
    });

    it('should reject space with too many components', () => {
      const invalidSpace = {
        ...validSpace,
        columns: 1 as const,
        components: [validComponent, { ...validComponent, id: 'component-2' }]
      };
      const errors = ReportValidationService.validateGridSpace(invalidSpace);
      
      expect(errors).toContainEqual(
        expect.objectContaining({
          type: 'grid',
          message: 'El espacio de 1 columna(s) no puede tener más de 1 componente(s)'
        })
      );
    });

    it('should reject components with invalid column indices', () => {
      const invalidComponent = { ...validComponent, columnIndex: 3 };
      const invalidSpace = {
        ...validSpace,
        columns: 2 as const,
        components: [invalidComponent]
      };
      const errors = ReportValidationService.validateGridSpace(invalidSpace);
      
      expect(errors).toContainEqual(
        expect.objectContaining({
          type: 'grid',
          message: 'Índice de columna inválido: 3 para espacio de 2 columnas'
        })
      );
    });

    it('should reject components with negative column indices', () => {
      const invalidComponent = { ...validComponent, columnIndex: -1 };
      const invalidSpace = {
        ...validSpace,
        components: [invalidComponent]
      };
      const errors = ReportValidationService.validateGridSpace(invalidSpace);
      
      expect(errors).toContainEqual(
        expect.objectContaining({
          type: 'grid',
          message: 'Índice de columna inválido: -1 para espacio de 2 columnas'
        })
      );
    });
  });

  describe('validateComponent', () => {
    it('should validate a correct component', () => {
      const errors = ReportValidationService.validateComponent(validComponent, validSpace, mockDataSources);
      expect(errors).toHaveLength(0);
    });

    it('should reject component without title', () => {
      const invalidComponent = {
        ...validComponent,
        config: { ...validComponent.config, title: '' }
      };
      const errors = ReportValidationService.validateComponent(invalidComponent, validSpace, mockDataSources);
      
      expect(errors).toContainEqual(
        expect.objectContaining({
          type: 'component',
          message: 'El componente debe tener un título válido'
        })
      );
    });

    it('should reject component without data source', () => {
      const invalidComponent = {
        ...validComponent,
        dataSource: { ...validComponent.dataSource, id: '' }
      };
      const errors = ReportValidationService.validateComponent(invalidComponent, validSpace, mockDataSources);
      
      expect(errors).toContainEqual(
        expect.objectContaining({
          type: 'component',
          message: 'El componente debe tener una fuente de datos asignada'
        })
      );
    });

    it('should reject component with incompatible data source', () => {
      const invalidComponent = {
        ...validComponent,
        type: 'generation-mix' as const,
        dataSource: mockDataSources[1] // demand data source
      };
      const errors = ReportValidationService.validateComponent(invalidComponent, validSpace, mockDataSources);
      
      expect(errors).toContainEqual(
        expect.objectContaining({
          type: 'data',
          message: expect.stringContaining('no es compatible')
        })
      );
    });
  });

  describe('canAddComponent', () => {
    it('should allow adding component to valid position', () => {
      const emptySpace = { ...validSpace, components: [] };
      const result = ReportValidationService.canAddComponent(emptySpace, 0, validComponent, mockDataSources);
      
      expect(result.canAdd).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject adding component to invalid column index', () => {
      const emptySpace = { ...validSpace, components: [] };
      const result = ReportValidationService.canAddComponent(emptySpace, 5, validComponent, mockDataSources);
      
      expect(result.canAdd).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: 'grid',
          message: 'Índice de columna inválido: 5 para espacio de 2 columnas'
        })
      );
    });

    it('should reject adding component to occupied column', () => {
      const result = ReportValidationService.canAddComponent(validSpace, 0, validComponent, mockDataSources);
      
      expect(result.canAdd).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: 'grid',
          message: 'La columna 0 ya está ocupada por otro componente'
        })
      );
    });

    it('should reject adding invalid component', () => {
      const emptySpace = { ...validSpace, components: [] };
      const invalidComponent = {
        ...validComponent,
        config: { ...validComponent.config, title: '' }
      };
      const result = ReportValidationService.canAddComponent(emptySpace, 0, invalidComponent, mockDataSources);
      
      expect(result.canAdd).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: 'component',
          message: 'El componente debe tener un título válido'
        })
      );
    });
  });

  describe('data-chart compatibility validation', () => {
    it('should validate generation-mix chart with energy-generation data', () => {
      const component = {
        ...validComponent,
        type: 'generation-mix' as const,
        dataSource: mockDataSources[0]
      };
      const errors = ReportValidationService.validateComponent(component, validSpace, mockDataSources);
      expect(errors).toHaveLength(0);
    });

    it('should validate demand-trend chart with demand data', () => {
      const component = {
        ...validComponent,
        type: 'demand-trend' as const,
        dataSource: mockDataSources[1]
      };
      const errors = ReportValidationService.validateComponent(component, validSpace, mockDataSources);
      expect(errors).toHaveLength(0);
    });

    it('should validate custom charts with custom data', () => {
      const component = {
        ...validComponent,
        type: 'custom-bar' as const,
        dataSource: mockDataSources[2]
      };
      const errors = ReportValidationService.validateComponent(component, validSpace, mockDataSources);
      expect(errors).toHaveLength(0);
    });

    it('should reject generation-mix chart with incompatible data', () => {
      const component = {
        ...validComponent,
        type: 'generation-mix' as const,
        dataSource: {
          ...mockDataSources[2],
          fields: [{ id: 'test', name: 'Test', type: 'string', required: true }]
        }
      };
      const errors = ReportValidationService.validateComponent(component, validSpace, mockDataSources);
      
      expect(errors).toContainEqual(
        expect.objectContaining({
          type: 'data',
          message: expect.stringContaining('no es compatible')
        })
      );
    });

    it('should reject line chart without time and value fields', () => {
      const incompatibleDataSource = {
        id: 'incompatible-line',
        name: 'Incompatible for Line',
        type: 'custom' as const,
        fields: [{ id: 'test', name: 'Test', type: 'string', required: true }], // Only string, no number
        sampleData: [{ test: 'value' }]
      };
      
      const component = {
        ...validComponent,
        type: 'custom-line' as const,
        dataSource: incompatibleDataSource
      };
      
      // Add the incompatible data source to the list for validation
      const dataSourcesWithIncompatible = [...mockDataSources, incompatibleDataSource];
      const errors = ReportValidationService.validateComponent(component, validSpace, dataSourcesWithIncompatible);
      
      expect(errors).toContainEqual(
        expect.objectContaining({
          type: 'data',
          message: expect.stringContaining('no es compatible')
        })
      );
    });

    it('should reject pie chart without category and numeric fields', () => {
      const incompatibleDataSource = {
        id: 'incompatible-pie',
        name: 'Incompatible for Pie',
        type: 'custom' as const,
        fields: [{ id: 'test', name: 'Test', type: 'string', required: true }], // Only string, no number/percentage
        sampleData: [{ test: 'value' }]
      };
      
      const component = {
        ...validComponent,
        type: 'custom-pie' as const,
        dataSource: incompatibleDataSource
      };
      
      // Add the incompatible data source to the list for validation
      const dataSourcesWithIncompatible = [...mockDataSources, incompatibleDataSource];
      const errors = ReportValidationService.validateComponent(component, validSpace, dataSourcesWithIncompatible);
      
      expect(errors).toContainEqual(
        expect.objectContaining({
          type: 'data',
          message: expect.stringContaining('no es compatible')
        })
      );
    });
  });

  describe('component configuration validation', () => {
    it('should reject component with invalid height', () => {
      const invalidComponent = {
        ...validComponent,
        config: { ...validComponent.config, height: 100 }
      };
      const result = ReportValidationService.validateConfig({
        ...validConfig,
        spaces: [{
          ...validSpace,
          components: [invalidComponent]
        }]
      }, mockDataSources);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: 'component',
          message: 'La altura del componente debe estar entre 200px y 800px'
        })
      );
    });

    it('should reject component without colors', () => {
      const invalidComponent = {
        ...validComponent,
        config: { ...validComponent.config, colors: [] }
      };
      const result = ReportValidationService.validateConfig({
        ...validConfig,
        spaces: [{
          ...validSpace,
          components: [invalidComponent]
        }]
      }, mockDataSources);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: 'component',
          message: 'El componente debe tener al menos un color definido'
        })
      );
    });
  });

  describe('getValidationSummary', () => {
    it('should return valid message for valid configuration', () => {
      const result = { isValid: true, errors: [], warnings: [] };
      const summary = ReportValidationService.getValidationSummary(result);
      expect(summary).toBe('Configuración válida');
    });

    it('should return error count for invalid configuration', () => {
      const result = {
        isValid: false,
        errors: [
          { type: 'canvas' as const, message: 'Error 1' },
          { type: 'component' as const, message: 'Error 2' }
        ],
        warnings: []
      };
      const summary = ReportValidationService.getValidationSummary(result);
      expect(summary).toBe('2 errores');
    });

    it('should handle singular error count', () => {
      const result = {
        isValid: false,
        errors: [{ type: 'canvas' as const, message: 'Error 1' }],
        warnings: []
      };
      const summary = ReportValidationService.getValidationSummary(result);
      expect(summary).toBe('1 error');
    });
  });
});