import * as XLSX from 'xlsx';
import type {
  ExcelColumn,
  ExcelDocument,
  ExcelFieldType,
  ExcelSheet,
} from '../types/mapper';

// ── Helpers ────────────────────────────────────────────────────────────────

function colIndexToLetter(idx: number): string {
  let letter = '';
  let n = idx + 1;
  while (n > 0) {
    const rem = (n - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    n = Math.floor((n - 1) / 26);
  }
  return letter;
}

function detectType(value: unknown): ExcelFieldType {
  if (value === null || value === undefined || value === '') return 'empty';
  if (typeof value === 'number') return 'number';
  // XLSX date serial numbers are numbers; already handled above.
  const str = String(value).trim();
  if (!str) return 'empty';
  // date patterns
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return 'date';
  if (/^\d{2}\/\d{2}\/\d{4}/.test(str)) return 'date';
  if (/^\d{6}$/.test(str)) return 'date'; // YYYYMM
  if (!isNaN(Number(str))) return 'number';
  return 'text';
}

/**
 * Given a worksheet and a range, returns the string value of a cell or ''.
 */
function cellText(ws: XLSX.WorkSheet, row: number, col: number): string {
  const addr = XLSX.utils.encode_cell({ r: row, c: col });
  const cell = ws[addr];
  if (!cell) return '';
  return cell.v !== undefined ? String(cell.v).trim() : '';
}

/**
 * Build a merge lookup: for each cell that is part of a merged region,
 * return the value from the top-left cell of that region.
 */
function buildMergeLookup(
  ws: XLSX.WorkSheet,
  maxRow: number,
  maxCol: number
): Map<string, string> {
  const lookup = new Map<string, string>();
  const merges: XLSX.Range[] = ws['!merges'] ?? [];

  for (const merge of merges) {
    const topLeft = XLSX.utils.encode_cell({ r: merge.s.r, c: merge.s.c });
    const topLeftCell = ws[topLeft];
    const val = topLeftCell?.v !== undefined ? String(topLeftCell.v).trim() : '';

    for (let r = merge.s.r; r <= Math.min(merge.e.r, maxRow); r++) {
      for (let c = merge.s.c; c <= Math.min(merge.e.c, maxCol); c++) {
        lookup.set(`${r}:${c}`, val);
      }
    }
  }
  return lookup;
}

/**
 * Detect how many header rows a sheet has.
 * Strategy: scan the first row. If all values are text (no numbers),
 * check the second row. If row 3 also looks like a header, use 3.
 * Defaults to 1 if uncertain.
 */
function detectHeaderRows(
  ws: XLSX.WorkSheet,
  range: XLSX.Range,
  mergeLookup: Map<string, string>
): number {
  const maxCol = range.e.c;

  const rowLooksLikeHeader = (row: number): boolean => {
    let textCount = 0;
    let total = 0;
    for (let c = 0; c <= maxCol; c++) {
      const val = mergeLookup.get(`${row}:${c}`) ?? cellText(ws, row, c);
      if (val) {
        total++;
        if (isNaN(Number(val))) textCount++;
      }
    }
    return total > 0 && textCount / total > 0.7;
  };

  if (rowLooksLikeHeader(0) && rowLooksLikeHeader(1) && rowLooksLikeHeader(2)) {
    return 3;
  }
  if (rowLooksLikeHeader(0) && rowLooksLikeHeader(1)) {
    return 2;
  }
  return 1;
}

function parseSheet(ws: XLSX.WorkSheet, sheetName: string): ExcelSheet {
  const ref = ws['!ref'];
  if (!ref) return { name: sheetName, columns: [], headerRows: 1, dataRows: 0 };

  const range = XLSX.utils.decode_range(ref);
  const maxCol = range.e.c;
  const maxRow = range.e.r;

  const mergeLookup = buildMergeLookup(ws, maxRow, maxCol);
  const headerRows = detectHeaderRows(ws, range, mergeLookup);

  // Build header path per column: join non-empty header values across header rows
  const columns: ExcelColumn[] = [];

  for (let c = 0; c <= maxCol; c++) {
    const parts: string[] = [];
    for (let r = 0; r < headerRows; r++) {
      const val = mergeLookup.get(`${r}:${c}`) ?? cellText(ws, r, c);
      if (val && !parts.includes(val)) parts.push(val);
    }

    const columnName = parts[parts.length - 1] ?? `Col ${colIndexToLetter(c)}`;
    const path = [sheetName, ...parts].join(' > ');

    // Sample value from first data row
    const firstDataRow = headerRows; // 0-based
    const sampleRaw = ws[XLSX.utils.encode_cell({ r: firstDataRow, c })]?.v;
    const sampleValue = sampleRaw !== undefined ? String(sampleRaw) : '';
    const type: ExcelFieldType = detectType(sampleRaw);

    columns.push({
      index: c,
      letter: colIndexToLetter(c),
      path,
      columnName,
      sampleValue,
      type,
    });
  }

  // Estimate data rows: total rows - header rows - 1 (footer)
  const dataRows = Math.max(0, maxRow - headerRows);

  return { name: sheetName, columns, headerRows, dataRows };
}

// ── Public API ─────────────────────────────────────────────────────────────

export async function parseExcelFile(file: File): Promise<ExcelDocument> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: false });

  const sheets: ExcelSheet[] = workbook.SheetNames.map((name) =>
    parseSheet(workbook.Sheets[name], name)
  );

  const totalColumns = sheets.reduce((sum, s) => sum + s.columns.length, 0);

  return {
    id: `${file.name}-${Date.now()}`,
    fileName: file.name,
    uploadedAt: new Date(),
    sheets,
    totalColumns,
  };
}

/**
 * Given a document and a list of { sourceSheet, sourceColumn } pairs,
 * validate whether those columns exist in the new file.
 */
export async function validateColumns(
  file: File,
  mappings: Array<{ mappingId: string; targetLabel: string; sourcePath: string; sourceSheet: string; sourceColumn: string }>
): Promise<Map<string, { found: boolean; value: string }>> {
  const doc = await parseExcelFile(file);
  const result = new Map<string, { found: boolean; value: string }>();

  for (const m of mappings) {
    const sheet = doc.sheets.find((s) => s.name === m.sourceSheet);
    if (!sheet) {
      result.set(m.mappingId, { found: false, value: '' });
      continue;
    }
    const col = sheet.columns.find((c) => c.path === m.sourcePath);
    if (!col) {
      result.set(m.mappingId, { found: false, value: '' });
      continue;
    }
    result.set(m.mappingId, { found: true, value: col.sampleValue });
  }

  return result;
}
