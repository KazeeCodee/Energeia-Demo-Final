// Datos que el sistema necesita obligatoriamente para sus cálculos.
// El usuario NO puede agregar ni eliminar estos campos — solo puede
// cambiar de qué columna y desde qué fila del Excel se leen.

export interface SystemField {
  id: string;
  label: string;
  description: string;
  category: string;
  unit?: string;
  defaultColumn: string;   // letra de columna por defecto (ej: "X")
  defaultStartRow: number; // fila donde empiezan los datos (ej: 4)
  defaultSheet: string;
}

export const SYSTEM_FIELDS: SystemField[] = [
  // ── Identificadores ────────────────────────────────────────────────────────
  {
    id: 'id_contrato',
    label: 'ID Contrato',
    description: 'Número único que identifica cada contrato de energía',
    category: 'Identificadores',
    defaultColumn: 'P',
    defaultStartRow: 4,
    defaultSheet: 'DTE PROVISORIO MATE',
  },
  {
    id: 'nemo_vendedor',
    label: 'Nemo Vendedor',
    description: 'Código del agente generador que vende la energía',
    category: 'Identificadores',
    defaultColumn: 'A',
    defaultStartRow: 4,
    defaultSheet: 'DTE PROVISORIO MATE',
  },
  {
    id: 'nemo_comprador',
    label: 'Nemo Comprador',
    description: 'Código del agente que compra la energía',
    category: 'Identificadores',
    defaultColumn: 'E',
    defaultStartRow: 4,
    defaultSheet: 'DTE PROVISORIO MATP',
  },
  {
    id: 'tipo_contrato',
    label: 'Tipo de Contrato',
    description: 'Clasificación del contrato (RPB, RPE, BAS, EXC)',
    category: 'Identificadores',
    defaultColumn: 'O',
    defaultStartRow: 4,
    defaultSheet: 'DTE PROVISORIO MATE',
  },

  // ── Energía mensual ────────────────────────────────────────────────────────
  {
    id: 'gen_inicial',
    label: 'Generación Inicial',
    description: 'Energía total que puede generar el conjunto en el mes',
    category: 'Energía mensual',
    unit: 'MWh',
    defaultColumn: 'E',
    defaultStartRow: 4,
    defaultSheet: 'DTE PROVISORIO MATE',
  },
  {
    id: 'consumo_base',
    label: 'Consumo Base',
    description: 'Energía base contratada y efectivamente entregada',
    category: 'Energía mensual',
    unit: 'MWh',
    defaultColumn: 'V',
    defaultStartRow: 4,
    defaultSheet: 'DTE PROVISORIO MATE',
  },
  {
    id: 'consumo_excedente',
    label: 'Consumo Excedente',
    description: 'Energía por encima del contrato base entregada',
    category: 'Energía mensual',
    unit: 'MWh',
    defaultColumn: 'W',
    defaultStartRow: 4,
    defaultSheet: 'DTE PROVISORIO MATE',
  },
  {
    id: 'consumo_total',
    label: 'Consumo Total',
    description: 'Suma de energía base + excedente del período',
    category: 'Energía mensual',
    unit: 'MWh',
    defaultColumn: 'X',
    defaultStartRow: 4,
    defaultSheet: 'DTE PROVISORIO MATE',
  },
  {
    id: 'saldo_total',
    label: 'Saldo del Período',
    description: 'Diferencia entre lo contratado y lo entregado',
    category: 'Energía mensual',
    unit: 'MWh',
    defaultColumn: 'AA',
    defaultStartRow: 4,
    defaultSheet: 'DTE PROVISORIO MATE',
  },

  // ── Potencias horarias ─────────────────────────────────────────────────────
  {
    id: 'fecha',
    label: 'Fecha',
    description: 'Fecha del registro horario de potencia',
    category: 'Potencias horarias',
    defaultColumn: 'K',
    defaultStartRow: 4,
    defaultSheet: 'DTE PROVISORIO MATP',
  },
  {
    id: 'potencia_contratada',
    label: 'Potencia Contratada',
    description: 'Potencia máxima acordada en el contrato mensual',
    category: 'Potencias horarias',
    unit: 'MW',
    defaultColumn: 'H',
    defaultStartRow: 4,
    defaultSheet: 'DTE PROVISORIO MATP',
  },
  {
    id: 'potencia_entregada',
    label: 'Potencia Entregada',
    description: 'Potencia real despachada en cada hora del mes',
    category: 'Potencias horarias',
    unit: 'MW',
    defaultColumn: 'M',
    defaultStartRow: 4,
    defaultSheet: 'DTE PROVISORIO MATP',
  },
];

export const FIELD_CATEGORIES = [...new Set(SYSTEM_FIELDS.map(f => f.category))];
