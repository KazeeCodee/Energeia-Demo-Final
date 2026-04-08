export type ExcelFieldType = 'number' | 'date' | 'text' | 'empty';

export interface ExcelColumn {
  /** 0-based column index */
  index: number;
  /** Column letter(s): A, B, ..., Z, AA, AB... */
  letter: string;
  /** Full header path: "Sheet > Group1 > Group2 > ColumnName" */
  path: string;
  /** Last-level header name */
  columnName: string;
  /** Sample value from first data row */
  sampleValue: string;
  type: ExcelFieldType;
}

export interface ExcelSheet {
  name: string;
  columns: ExcelColumn[];
  headerRows: number;
  dataRows: number;
}

export interface ExcelDocument {
  id: string;
  fileName: string;
  uploadedAt: Date;
  sheets: ExcelSheet[];
  totalColumns: number;
}

// ── Column bindings ────────────────────────────────────────────────────────

export interface ColumnBinding {
  /** ID of the SystemField this is bound to */
  fieldId: string;
  /** Sheet name, e.g. "DTE PROVISORIO MATE" */
  sheet: string;
  /** Column letter the user has selected, e.g. "X" or "AA" */
  column: string;
  /** Row number where data starts (1-based), e.g. 4 */
  startRow: number;
  /** Last sample value read (shown as feedback) */
  lastValue?: string;
  /** Whether the last test found this column (undefined = never tested) */
  lastStatus?: 'ok' | 'error';
  updatedAt: Date;
}

// ── Mappings (legacy, kept for compatibility) ──────────────────────────────

export interface FieldMapping {
  id: string;
  /** Slug, e.g. "energia_generada_inicial" */
  targetField: string;
  /** Human label, e.g. "Energía Generada Inicial" */
  targetLabel: string;
  description: string;
  /** Full column path: "Sheet > Group > ColumnName" */
  sourcePath: string;
  /** Column letter for quick reference, e.g. "E" */
  sourceColumn: string;
  sourceSheet: string;
  sourceFileName: string;
  dataType: ExcelFieldType;
  createdAt: Date;
}

// ── Validation ─────────────────────────────────────────────────────────────

export type ValidationStatus = 'ok' | 'missing' | 'type_changed';

export interface ValidationResult {
  mappingId: string;
  targetLabel: string;
  sourcePath: string;
  sourceColumn: string;
  sourceSheet: string;
  status: ValidationStatus;
  foundValue?: string;
  message: string;
}

export interface ValidationRun {
  id: string;
  fileName: string;
  runAt: Date;
  results: ValidationResult[];
  totalOk: number;
  totalMissing: number;
}
