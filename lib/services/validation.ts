import { ReportConfig, GridSpace, ChartComponent, ValidationError, DataSource, ChartComponentType } from '../types/constructor';

export interface ValidationRule {
  id: string;
  name: string;
  validate: (config: ReportConfig, dataSources: DataSource[]) => ValidationError[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Comprehensive validation service for report configurations
 */
export class ReportValidationService {
  private static rules: ValidationRule[] = [
    {
      id: 'canvas-not-empty',
      name: 'Canvas debe tener al menos un componente',
      validate: (config: ReportConfig) => {
        const totalComponents = config.spaces.reduce(
          (total, space) => total + space.components.length,
          0
        );

        if (totalComponents === 0) {
          return [{
            type: 'canvas',
            message: 'El informe debe tener al menos un componente para ser válido',
          }];
        }

        return [];
      }
    },
    {
      id: 'grid-column-limits',
      name: 'Validar límites de columnas por espacio',
      validate: (config: ReportConfig) => {
        const errors: ValidationError[] = [];

        config.spaces.forEach(space => {
          // Check maximum components per space (max 3 per column)
          const maxComponentsAllowed = space.columns * 3;
          if (space.components.length > maxComponentsAllowed) {
            errors.push({
              type: 'grid',
              message: `El espacio de ${space.columns} columna(s) no puede tener más de ${maxComponentsAllowed} componente(s) (máximo 3 por columna). Actualmente tiene ${space.components.length}`,
              spaceId: space.id,
            });
          }

          // Check for too many components per column (max 3 per column)
          const componentsByColumn = space.components.reduce((acc, comp) => {
            acc[comp.columnIndex] = (acc[comp.columnIndex] || 0) + 1;
            return acc;
          }, {} as Record<number, number>);
          
          Object.entries(componentsByColumn).forEach(([columnIndex, count]) => {
            if (count > 3) {
              errors.push({
                type: 'grid',
                message: `La columna ${columnIndex} tiene demasiados componentes (${count}). Máximo permitido: 3`,
                spaceId: space.id,
              });
            }
          });

          // Check for invalid column indices
          space.components.forEach(component => {
            if (component.columnIndex >= space.columns || component.columnIndex < 0) {
              errors.push({
                type: 'grid',
                message: `Índice de columna inválido: ${component.columnIndex} para espacio de ${space.columns} columnas`,
                componentId: component.id,
                spaceId: space.id,
              });
            }
          });
        });

        return errors;
      }
    },
    {
      id: 'component-required-config',
      name: 'Validar configuración requerida de componentes',
      validate: (config: ReportConfig) => {
        const errors: ValidationError[] = [];

        config.spaces.forEach(space => {
          space.components.forEach(component => {
            // Validate title is present and not empty
            if (!component.config.title?.trim()) {
              errors.push({
                type: 'component',
                message: 'El componente debe tener un título válido',
                componentId: component.id,
                spaceId: space.id,
              });
            }

            // Validate data source is assigned
            if (!component.dataSource?.id) {
              errors.push({
                type: 'component',
                message: 'El componente debe tener una fuente de datos asignada',
                componentId: component.id,
                spaceId: space.id,
              });
            }

            // Validate height is within reasonable bounds
            if (component.config.height < 200 || component.config.height > 800) {
              errors.push({
                type: 'component',
                message: 'La altura del componente debe estar entre 200px y 800px',
                componentId: component.id,
                spaceId: space.id,
              });
            }

            // Validate colors array is not empty
            if (!component.config.colors || component.config.colors.length === 0) {
              errors.push({
                type: 'component',
                message: 'El componente debe tener al menos un color definido',
                componentId: component.id,
                spaceId: space.id,
              });
            }
          });
        });

        return errors;
      }
    },
    {
      id: 'data-chart-compatibility',
      name: 'Validar compatibilidad entre datos y tipo de gráfico',
      validate: (config: ReportConfig, dataSources: DataSource[]) => {
        const errors: ValidationError[] = [];
        const dataSourceMap = new Map(dataSources.map(ds => [ds.id, ds]));

        config.spaces.forEach(space => {
          space.components.forEach(component => {
            const dataSource = dataSourceMap.get(component.dataSource.id);
            
            if (!dataSource) {
              errors.push({
                type: 'data',
                message: 'La fuente de datos seleccionada no existe o no está disponible',
                componentId: component.id,
                spaceId: space.id,
              });
              return;
            }

            // Validate data compatibility based on chart type
            const compatibilityError = this.validateDataChartCompatibility(
              component.type,
              dataSource,
              component.id,
              space.id
            );

            if (compatibilityError) {
              errors.push(compatibilityError);
            }
          });
        });

        return errors;
      }
    },
    {
      id: 'config-structure',
      name: 'Validar estructura básica de configuración',
      validate: (config: ReportConfig) => {
        const errors: ValidationError[] = [];

        // Validate config has required fields
        if (!config.id) {
          errors.push({
            type: 'canvas',
            message: 'La configuración debe tener un ID válido',
          });
        }

        if (!config.name?.trim()) {
          errors.push({
            type: 'canvas',
            message: 'La configuración debe tener un nombre válido',
          });
        }

        // Validate spaces have unique IDs
        const spaceIds = config.spaces.map(space => space.id);
        const duplicateSpaceIds = spaceIds.filter((id, index) => spaceIds.indexOf(id) !== index);
        
        if (duplicateSpaceIds.length > 0) {
          errors.push({
            type: 'canvas',
            message: `Hay espacios con IDs duplicados: ${duplicateSpaceIds.join(', ')}`,
          });
        }

        // Validate components have unique IDs within the entire config
        const allComponentIds: string[] = [];
        config.spaces.forEach(space => {
          space.components.forEach(component => {
            allComponentIds.push(component.id);
          });
        });

        const duplicateComponentIds = allComponentIds.filter((id, index) => allComponentIds.indexOf(id) !== index);
        
        if (duplicateComponentIds.length > 0) {
          errors.push({
            type: 'canvas',
            message: `Hay componentes con IDs duplicados: ${duplicateComponentIds.join(', ')}`,
          });
        }

        return errors;
      }
    }
  ];

  /**
   * Validate data source compatibility with chart type
   */
  private static validateDataChartCompatibility(
    chartType: ChartComponentType,
    dataSource: DataSource,
    componentId: string,
    spaceId: string
  ): ValidationError | null {
    const requiredFieldTypes: Record<ChartComponentType, string[]> = {
      'generation-mix': ['percentage'],
      'demand-trend': ['number', 'string'],
      'cost-comparison': ['number', 'string'],
      'multi-series': ['number'],
      'custom-bar': ['number', 'string'],
      'custom-line': ['number'],
      'custom-pie': ['percentage', 'number'],
    };

    const requiredTypes = requiredFieldTypes[chartType];
    if (!requiredTypes) {
      return {
        type: 'data',
        message: `Tipo de gráfico no reconocido: ${chartType}`,
        componentId,
        spaceId,
      };
    }

    // Check if data source has required field types
    const hasRequiredTypes = requiredTypes.some(type =>
      dataSource.fields.some(field => field.type === type && field.required)
    );

    if (!hasRequiredTypes) {
      return {
        type: 'data',
        message: `La fuente de datos "${dataSource.name}" no es compatible con el gráfico tipo "${chartType}". Se requieren campos de tipo: ${requiredTypes.join(', ')}`,
        componentId,
        spaceId,
      };
    }

    // Specific validations per chart type
    switch (chartType) {
      case 'generation-mix':
        const percentageFields = dataSource.fields.filter(f => f.type === 'percentage');
        if (percentageFields.length < 2) {
          return {
            type: 'data',
            message: 'Los gráficos de mezcla de generación requieren al menos 2 campos de porcentaje',
            componentId,
            spaceId,
          };
        }
        break;

      case 'demand-trend':
      case 'custom-line':
        const hasTimeField = dataSource.fields.some(f => f.type === 'string' || f.type === 'date');
        const hasValueField = dataSource.fields.some(f => f.type === 'number');
        
        if (!hasTimeField || !hasValueField) {
          return {
            type: 'data',
            message: 'Los gráficos de tendencia requieren al menos un campo de tiempo y un campo numérico',
            componentId,
            spaceId,
          };
        }
        break;

      case 'custom-pie':
        const hasCategoryField = dataSource.fields.some(f => f.type === 'string');
        const hasNumericField = dataSource.fields.some(f => f.type === 'number' || f.type === 'percentage');
        
        if (!hasCategoryField || !hasNumericField) {
          return {
            type: 'data',
            message: 'Los gráficos de torta requieren al menos un campo de categoría y un campo numérico',
            componentId,
            spaceId,
          };
        }
        break;
    }

    return null;
  }

  /**
   * Validate a complete report configuration
   */
  static validateConfig(config: ReportConfig, dataSources: DataSource[] = []): ValidationResult {
    const allErrors: ValidationError[] = [];

    // Run all validation rules
    this.rules.forEach(rule => {
      try {
        const errors = rule.validate(config, dataSources);
        allErrors.push(...errors);
      } catch (error) {
        // If a validation rule fails, add it as a validation error
        allErrors.push({
          type: 'canvas',
          message: `Error en validación "${rule.name}": ${error instanceof Error ? error.message : 'Error desconocido'}`,
        });
      }
    });

    // For now, all are errors (no warnings)
    const errors = allErrors;
    const warnings: ValidationError[] = [];

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate a specific component
   */
  static validateComponent(
    component: ChartComponent,
    space: GridSpace,
    dataSources: DataSource[]
  ): ValidationError[] {
    const errors: ValidationError[] = [];
    const dataSourceMap = new Map(dataSources.map(ds => [ds.id, ds]));

    // Validate component configuration
    if (!component.config.title?.trim()) {
      errors.push({
        type: 'component',
        message: 'El componente debe tener un título válido',
        componentId: component.id,
        spaceId: space.id,
      });
    }

    if (!component.dataSource?.id) {
      errors.push({
        type: 'component',
        message: 'El componente debe tener una fuente de datos asignada',
        componentId: component.id,
        spaceId: space.id,
      });
    }

    // Validate data source compatibility
    const dataSource = dataSourceMap.get(component.dataSource.id);
    if (dataSource) {
      const compatibilityError = this.validateDataChartCompatibility(
        component.type,
        dataSource,
        component.id,
        space.id
      );

      if (compatibilityError) {
        errors.push(compatibilityError);
      }
    }

    return errors;
  }

  /**
   * Validate grid space constraints
   */
  static validateGridSpace(space: GridSpace): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check maximum components per space
    if (space.components.length > space.columns) {
      errors.push({
        type: 'grid',
        message: `El espacio de ${space.columns} columna(s) no puede tener más de ${space.columns} componente(s)`,
        spaceId: space.id,
      });
    }

    // Check for valid column indices
    space.components.forEach(component => {
      if (component.columnIndex >= space.columns || component.columnIndex < 0) {
        errors.push({
          type: 'grid',
          message: `Índice de columna inválido: ${component.columnIndex} para espacio de ${space.columns} columnas`,
          componentId: component.id,
          spaceId: space.id,
        });
      }
    });

    return errors;
  }

  /**
   * Check if a component can be added to a specific position
   */
  static canAddComponent(
    space: GridSpace,
    columnIndex: number,
    component: ChartComponent,
    dataSources: DataSource[]
  ): { canAdd: boolean; errors: ValidationError[] } {
    const errors: ValidationError[] = [];

    // Check column index validity
    if (columnIndex >= space.columns || columnIndex < 0) {
      errors.push({
        type: 'grid',
        message: `Índice de columna inválido: ${columnIndex} para espacio de ${space.columns} columnas`,
        spaceId: space.id,
      });
    }

    // Check if column has too many components (allow up to 3 per column)
    const componentsInColumn = space.components.filter(comp => comp.columnIndex === columnIndex);
    if (componentsInColumn.length >= 3) {
      errors.push({
        type: 'grid',
        message: `La columna ${columnIndex} ya tiene el máximo de componentes permitidos (3)`,
        spaceId: space.id,
      });
    }

    // Validate component itself
    const componentErrors = this.validateComponent(component, space, dataSources);
    errors.push(...componentErrors);

    return {
      canAdd: errors.length === 0,
      errors,
    };
  }

  /**
   * Get validation summary for UI display
   */
  static getValidationSummary(result: ValidationResult): string {
    if (result.isValid) {
      return 'Configuración válida';
    }

    const errorCount = result.errors.length;
    const warningCount = result.warnings.length;

    let summary = '';
    if (errorCount > 0) {
      summary += `${errorCount} error${errorCount > 1 ? 'es' : ''}`;
    }
    if (warningCount > 0) {
      if (summary) summary += ', ';
      summary += `${warningCount} advertencia${warningCount > 1 ? 's' : ''}`;
    }

    return summary;
  }
}