import { describe, it, expect, beforeEach } from 'vitest';
import { DataSource, ChartComponent, ChartComponentType } from '../../types/constructor';

// Data transformation utilities for chart components
class DataTransformationService {
  /**
   * Transform data source data for specific chart types
   */
  static transformDataForChart(
    dataSource: DataSource,
    chartType: ChartComponentType,
    config?: { colors?: string[]; customOptions?: Record<string, any> }
  ): any[] {
    if (!dataSource.sampleData || dataSource.sampleData.length === 0) {
      return [];
    }

    switch (chartType) {
      case 'generation-mix':
        return this.transformForGenerationMix(dataSource, config?.colors);
      
      case 'demand-trend':
        return this.transformForDemandTrend(dataSource);
      
      case 'cost-comparison':
        return this.transformForCostComparison(dataSource, config?.colors);
      
      case 'custom-bar':
        return this.transformForBarChart(dataSource, config?.colors);
      
      case 'custom-line':
        return this.transformForLineChart(dataSource);
      
      case 'custom-pie':
        return this.transformForPieChart(dataSource, config?.colors);
      
      case 'multi-series':
        return this.transformForMultiSeries(dataSource, config?.colors);
      
      default:
        return dataSource.sampleData;
    }
  }

  /**
   * Transform data for generation mix pie chart
   */
  private static transformForGenerationMix(dataSource: DataSource, colors?: string[]): any[] {
    const data = dataSource.sampleData[0] || {};
    const percentageFields = dataSource.fields.filter(f => f.type === 'percentage');
    
    return percentageFields.map((field, index) => ({
      name: field.name,
      value: data[field.id] || 0,
      color: colors?.[index] || this.getDefaultColor(index),
      percentage: data[field.id] || 0,
    }));
  }

  /**
   * Transform data for demand trend line chart
   */
  private static transformForDemandTrend(dataSource: DataSource): any[] {
    return dataSource.sampleData.map(item => {
      const timeField = dataSource.fields.find(f => f.type === 'string' || f.type === 'date');
      const valueField = dataSource.fields.find(f => f.type === 'number');
      
      return {
        name: timeField ? item[timeField.id] : 'N/A',
        value: valueField ? item[valueField.id] : 0,
        ...item, // Include all original data
      };
    });
  }

  /**
   * Transform data for cost comparison bar chart
   */
  private static transformForCostComparison(dataSource: DataSource, colors?: string[]): any[] {
    return dataSource.sampleData.map((item, index) => {
      const categoryField = dataSource.fields.find(f => f.type === 'string');
      const costField = dataSource.fields.find(f => f.type === 'number' && f.id.includes('cost'));
      const budgetField = dataSource.fields.find(f => f.type === 'number' && f.id.includes('budget'));
      
      return {
        name: categoryField ? item[categoryField.id] : `Item ${index + 1}`,
        cost: costField ? item[costField.id] : 0,
        budget: budgetField ? item[budgetField.id] : undefined,
        color: colors?.[index] || this.getDefaultColor(index),
        ...item,
      };
    });
  }

  /**
   * Transform data for generic bar chart
   */
  private static transformForBarChart(dataSource: DataSource, colors?: string[]): any[] {
    return dataSource.sampleData.map((item, index) => {
      const categoryField = dataSource.fields.find(f => f.type === 'string');
      const valueField = dataSource.fields.find(f => f.type === 'number');
      
      return {
        name: categoryField ? item[categoryField.id] : `Category ${index + 1}`,
        value: valueField ? item[valueField.id] : 0,
        color: colors?.[index] || this.getDefaultColor(index),
        ...item,
      };
    });
  }

  /**
   * Transform data for line chart
   */
  private static transformForLineChart(dataSource: DataSource): any[] {
    return dataSource.sampleData.map(item => {
      const xField = dataSource.fields.find(f => f.type === 'string' || f.type === 'date');
      const yField = dataSource.fields.find(f => f.type === 'number');
      
      return {
        x: xField ? item[xField.id] : 0,
        y: yField ? item[yField.id] : 0,
        name: xField ? item[xField.id] : 'N/A',
        value: yField ? item[yField.id] : 0,
        ...item,
      };
    });
  }

  /**
   * Transform data for pie chart
   */
  private static transformForPieChart(dataSource: DataSource, colors?: string[]): any[] {
    return dataSource.sampleData.map((item, index) => {
      const nameField = dataSource.fields.find(f => f.type === 'string');
      const valueField = dataSource.fields.find(f => f.type === 'number' || f.type === 'percentage');
      
      return {
        name: nameField ? item[nameField.id] : `Slice ${index + 1}`,
        value: valueField ? item[valueField.id] : 0,
        color: colors?.[index] || this.getDefaultColor(index),
        ...item,
      };
    });
  }

  /**
   * Transform data for multi-series chart
   */
  private static transformForMultiSeries(dataSource: DataSource, colors?: string[]): any[] {
    const numericFields = dataSource.fields.filter(f => f.type === 'number');
    const categoryField = dataSource.fields.find(f => f.type === 'string');
    
    return dataSource.sampleData.map(item => {
      const transformed: any = {
        name: categoryField ? item[categoryField.id] : 'N/A',
      };
      
      numericFields.forEach((field, index) => {
        transformed[field.id] = item[field.id] || 0;
        transformed[`${field.id}_color`] = colors?.[index] || this.getDefaultColor(index);
      });
      
      return transformed;
    });
  }

  /**
   * Get default color for chart elements
   */
  private static getDefaultColor(index: number): string {
    const defaultColors = [
      '#FF7A00', '#00A3FF', '#00D4AA', '#FFB800', 
      '#FF4757', '#5F27CD', '#00D2D3', '#FF9FF3',
      '#54A0FF', '#5F27CD'
    ];
    return defaultColors[index % defaultColors.length];
  }

  /**
   * Validate that data can be transformed for the given chart type
   */
  static canTransformData(dataSource: DataSource, chartType: ChartComponentType): boolean {
    if (!dataSource.sampleData || dataSource.sampleData.length === 0) {
      return false;
    }

    switch (chartType) {
      case 'generation-mix':
        return dataSource.fields.some(f => f.type === 'percentage');
      
      case 'demand-trend':
      case 'custom-line':
        return dataSource.fields.some(f => f.type === 'string' || f.type === 'date') &&
               dataSource.fields.some(f => f.type === 'number');
      
      case 'cost-comparison':
      case 'custom-bar':
        return dataSource.fields.some(f => f.type === 'string') &&
               dataSource.fields.some(f => f.type === 'number');
      
      case 'custom-pie':
        return dataSource.fields.some(f => f.type === 'string') &&
               dataSource.fields.some(f => f.type === 'number' || f.type === 'percentage');
      
      case 'multi-series':
        return dataSource.fields.filter(f => f.type === 'number').length >= 2;
      
      default:
        return true;
    }
  }

  /**
   * Get required fields for a chart type
   */
  static getRequiredFields(chartType: ChartComponentType): string[] {
    switch (chartType) {
      case 'generation-mix':
        return ['percentage'];
      
      case 'demand-trend':
      case 'custom-line':
        return ['string|date', 'number'];
      
      case 'cost-comparison':
      case 'custom-bar':
        return ['string', 'number'];
      
      case 'custom-pie':
        return ['string', 'number|percentage'];
      
      case 'multi-series':
        return ['number (2+)'];
      
      default:
        return [];
    }
  }

  /**
   * Calculate aggregated statistics from transformed data
   */
  static calculateStatistics(transformedData: any[], chartType: ChartComponentType): Record<string, number> {
    if (!transformedData || transformedData.length === 0) {
      return {};
    }

    const stats: Record<string, number> = {};

    switch (chartType) {
      case 'generation-mix':
      case 'custom-pie':
        const total = transformedData.reduce((sum, item) => sum + (item.value || 0), 0);
        stats.total = total;
        stats.count = transformedData.length;
        stats.average = total / transformedData.length;
        break;
      
      case 'demand-trend':
      case 'custom-line':
      case 'custom-bar':
        const values = transformedData.map(item => item.value || 0);
        stats.min = Math.min(...values);
        stats.max = Math.max(...values);
        stats.average = values.reduce((sum, val) => sum + val, 0) / values.length;
        stats.total = values.reduce((sum, val) => sum + val, 0);
        break;
      
      case 'cost-comparison':
        const costs = transformedData.map(item => item.cost || 0);
        const budgets = transformedData.map(item => item.budget || 0).filter(b => b > 0);
        
        stats.totalCost = costs.reduce((sum, val) => sum + val, 0);
        stats.averageCost = costs.reduce((sum, val) => sum + val, 0) / costs.length;
        
        if (budgets.length > 0) {
          stats.totalBudget = budgets.reduce((sum, val) => sum + val, 0);
          stats.budgetVariance = stats.totalBudget - stats.totalCost;
        }
        break;
      
      case 'multi-series':
        // Calculate stats for each numeric series
        const firstItem = transformedData[0];
        Object.keys(firstItem).forEach(key => {
          if (typeof firstItem[key] === 'number' && key !== 'name') {
            const seriesValues = transformedData.map(item => item[key] || 0);
            stats[`${key}_total`] = seriesValues.reduce((sum, val) => sum + val, 0);
            stats[`${key}_average`] = stats[`${key}_total`] / seriesValues.length;
          }
        });
        break;
    }

    return stats;
  }
}

describe('DataTransformationService', () => {
  let mockDataSources: DataSource[];

  beforeEach(() => {
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
          { id: 'variation', name: 'Variación (%)', type: 'percentage', required: false },
        ],
        sampleData: [
          { month: 'Ene', demand: 1200, variation: 5.2 },
          { month: 'Feb', demand: 1150, variation: -2.1 },
          { month: 'Mar', demand: 1300, variation: 8.7 },
        ]
      },
      {
        id: 'cost-comparison',
        name: 'Comparación de Costos',
        type: 'cost',
        fields: [
          { id: 'category', name: 'Categoría', type: 'string', required: true },
          { id: 'cost', name: 'Costo (USD/MWh)', type: 'number', required: true },
          { id: 'budget', name: 'Presupuesto', type: 'number', required: false },
        ],
        sampleData: [
          { category: 'CAMMESA', cost: 45.2, budget: 50.0 },
          { category: 'PLUS', cost: 38.7, budget: 40.0 },
          { category: 'Renovable', cost: 42.1, budget: 45.0 },
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
        sampleData: [
          { category: 'Q1', value: 120 },
          { category: 'Q2', value: 150 },
          { category: 'Q3', value: 180 },
          { category: 'Q4', value: 200 },
        ]
      }
    ];
  });

  describe('transformDataForChart', () => {
    it('should transform data for generation-mix chart', () => {
      const result = DataTransformationService.transformDataForChart(
        mockDataSources[0], 
        'generation-mix',
        { colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'] }
      );

      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({
        name: 'Térmica',
        value: 45,
        color: '#FF0000',
        percentage: 45,
      });
      expect(result[1]).toEqual({
        name: 'Hidráulica',
        value: 25,
        color: '#00FF00',
        percentage: 25,
      });
    });

    it('should transform data for demand-trend chart', () => {
      const result = DataTransformationService.transformDataForChart(
        mockDataSources[1], 
        'demand-trend'
      );

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        name: 'Ene',
        value: 1200,
        month: 'Ene',
        demand: 1200,
        variation: 5.2,
      });
      expect(result[1]).toEqual({
        name: 'Feb',
        value: 1150,
        month: 'Feb',
        demand: 1150,
        variation: -2.1,
      });
    });

    it('should transform data for cost-comparison chart', () => {
      const result = DataTransformationService.transformDataForChart(
        mockDataSources[2], 
        'cost-comparison',
        { colors: ['#FF7A00', '#00A3FF', '#00D4AA'] }
      );

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        name: 'CAMMESA',
        cost: 45.2,
        budget: 50.0,
        color: '#FF7A00',
        category: 'CAMMESA',
      });
    });

    it('should transform data for custom-bar chart', () => {
      const result = DataTransformationService.transformDataForChart(
        mockDataSources[3], 
        'custom-bar'
      );

      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({
        name: 'Q1',
        value: 120,
        color: '#FF7A00',
        category: 'Q1',
      });
    });

    it('should transform data for custom-line chart', () => {
      const result = DataTransformationService.transformDataForChart(
        mockDataSources[1], 
        'custom-line'
      );

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        x: 'Ene',
        y: 1200,
        name: 'Ene',
        value: 1200,
        month: 'Ene',
        demand: 1200,
        variation: 5.2,
      });
    });

    it('should transform data for custom-pie chart', () => {
      const result = DataTransformationService.transformDataForChart(
        mockDataSources[3], 
        'custom-pie',
        { colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'] }
      );

      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({
        name: 'Q1',
        value: 120,
        color: '#FF0000',
        category: 'Q1',
      });
    });

    it('should return empty array for empty data source', () => {
      const emptyDataSource = { ...mockDataSources[0], sampleData: [] };
      const result = DataTransformationService.transformDataForChart(
        emptyDataSource, 
        'generation-mix'
      );

      expect(result).toEqual([]);
    });

    it('should use default colors when none provided', () => {
      const result = DataTransformationService.transformDataForChart(
        mockDataSources[0], 
        'generation-mix'
      );

      expect(result[0].color).toBe('#FF7A00');
      expect(result[1].color).toBe('#00A3FF');
      expect(result[2].color).toBe('#00D4AA');
      expect(result[3].color).toBe('#FFB800');
    });
  });

  describe('canTransformData', () => {
    it('should return true for compatible data and chart type', () => {
      expect(DataTransformationService.canTransformData(mockDataSources[0], 'generation-mix')).toBe(true);
      expect(DataTransformationService.canTransformData(mockDataSources[1], 'demand-trend')).toBe(true);
      expect(DataTransformationService.canTransformData(mockDataSources[2], 'cost-comparison')).toBe(true);
      expect(DataTransformationService.canTransformData(mockDataSources[3], 'custom-bar')).toBe(true);
    });

    it('should return false for incompatible data and chart type', () => {
      // Create a data source with only string fields (no numbers or percentages)
      const stringOnlyDataSource: DataSource = {
        id: 'string-only',
        name: 'String Only Data',
        type: 'custom',
        fields: [
          { id: 'text1', name: 'Text 1', type: 'string', required: true },
          { id: 'text2', name: 'Text 2', type: 'string', required: true },
        ],
        sampleData: [{ text1: 'A', text2: 'B' }]
      };

      // Create a data source with only number fields (no strings or percentages)
      const numberOnlyDataSource: DataSource = {
        id: 'number-only',
        name: 'Number Only Data',
        type: 'custom',
        fields: [
          { id: 'num1', name: 'Number 1', type: 'number', required: true },
        ],
        sampleData: [{ num1: 100 }]
      };

      expect(DataTransformationService.canTransformData(stringOnlyDataSource, 'generation-mix')).toBe(false);
      expect(DataTransformationService.canTransformData(numberOnlyDataSource, 'demand-trend')).toBe(false);
    });

    it('should return false for empty data source', () => {
      const emptyDataSource = { ...mockDataSources[0], sampleData: [] };
      expect(DataTransformationService.canTransformData(emptyDataSource, 'generation-mix')).toBe(false);
    });

    it('should validate multi-series requirements', () => {
      const multiSeriesData: DataSource = {
        id: 'multi-series',
        name: 'Multi Series',
        type: 'custom',
        fields: [
          { id: 'category', name: 'Category', type: 'string', required: true },
          { id: 'series1', name: 'Series 1', type: 'number', required: true },
          { id: 'series2', name: 'Series 2', type: 'number', required: true },
        ],
        sampleData: [{ category: 'A', series1: 10, series2: 20 }]
      };

      expect(DataTransformationService.canTransformData(multiSeriesData, 'multi-series')).toBe(true);
      expect(DataTransformationService.canTransformData(mockDataSources[3], 'multi-series')).toBe(false);
    });
  });

  describe('getRequiredFields', () => {
    it('should return correct required fields for each chart type', () => {
      expect(DataTransformationService.getRequiredFields('generation-mix')).toEqual(['percentage']);
      expect(DataTransformationService.getRequiredFields('demand-trend')).toEqual(['string|date', 'number']);
      expect(DataTransformationService.getRequiredFields('cost-comparison')).toEqual(['string', 'number']);
      expect(DataTransformationService.getRequiredFields('custom-bar')).toEqual(['string', 'number']);
      expect(DataTransformationService.getRequiredFields('custom-line')).toEqual(['string|date', 'number']);
      expect(DataTransformationService.getRequiredFields('custom-pie')).toEqual(['string', 'number|percentage']);
      expect(DataTransformationService.getRequiredFields('multi-series')).toEqual(['number (2+)']);
    });
  });

  describe('calculateStatistics', () => {
    it('should calculate statistics for generation-mix data', () => {
      const transformedData = DataTransformationService.transformDataForChart(
        mockDataSources[0], 
        'generation-mix'
      );
      const stats = DataTransformationService.calculateStatistics(transformedData, 'generation-mix');

      expect(stats.total).toBe(100);
      expect(stats.count).toBe(4);
      expect(stats.average).toBe(25);
    });

    it('should calculate statistics for demand-trend data', () => {
      const transformedData = DataTransformationService.transformDataForChart(
        mockDataSources[1], 
        'demand-trend'
      );
      const stats = DataTransformationService.calculateStatistics(transformedData, 'demand-trend');

      expect(stats.min).toBe(1150);
      expect(stats.max).toBe(1300);
      expect(stats.average).toBe(1216.6666666666667);
      expect(stats.total).toBe(3650);
    });

    it('should calculate statistics for cost-comparison data', () => {
      const transformedData = DataTransformationService.transformDataForChart(
        mockDataSources[2], 
        'cost-comparison'
      );
      const stats = DataTransformationService.calculateStatistics(transformedData, 'cost-comparison');

      expect(stats.totalCost).toBe(126);
      expect(stats.averageCost).toBe(42);
      expect(stats.totalBudget).toBe(135);
      expect(stats.budgetVariance).toBe(9);
    });

    it('should return empty stats for empty data', () => {
      const stats = DataTransformationService.calculateStatistics([], 'generation-mix');
      expect(stats).toEqual({});
    });

    it('should calculate statistics for multi-series data', () => {
      const multiSeriesData: DataSource = {
        id: 'multi-series',
        name: 'Multi Series',
        type: 'custom',
        fields: [
          { id: 'category', name: 'Category', type: 'string', required: true },
          { id: 'series1', name: 'Series 1', type: 'number', required: true },
          { id: 'series2', name: 'Series 2', type: 'number', required: true },
        ],
        sampleData: [
          { category: 'A', series1: 10, series2: 20 },
          { category: 'B', series1: 15, series2: 25 },
        ]
      };

      const transformedData = DataTransformationService.transformDataForChart(
        multiSeriesData, 
        'multi-series'
      );
      const stats = DataTransformationService.calculateStatistics(transformedData, 'multi-series');

      expect(stats.series1_total).toBe(25);
      expect(stats.series1_average).toBe(12.5);
      expect(stats.series2_total).toBe(45);
      expect(stats.series2_average).toBe(22.5);
    });
  });
});