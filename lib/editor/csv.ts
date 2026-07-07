export type EditorRecord = Record<string, string | number | boolean | null>;

function parseCell(value: string): string | number | boolean | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;

  const normalized = trimmed.replace(",", ".");
  if (/^-?\d+(\.\d+)?$/.test(normalized)) {
    return Number(normalized);
  }

  return trimmed;
}

function splitCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === "," && !quoted) {
      cells.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current);
  return cells;
}

export function parseCsv(csv: string): { columns: string[]; records: EditorRecord[] } {
  const lines = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("CSV must include a header row and at least one data row");
  }

  const columns = splitCsvLine(lines[0]).map((column) => column.trim());
  const records = lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    return columns.reduce<EditorRecord>((record, column, index) => {
      record[column] = parseCell(cells[index] ?? "");
      return record;
    }, {});
  });

  return { columns, records };
}
