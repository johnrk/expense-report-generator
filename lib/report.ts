import ExcelJS from 'exceljs';
import { EQUAL_BILL_KEYS, Person, ROSTER } from './constants';
import { splitEqualWithRotation } from './split';

export type ReportInput = {
  month: string;
  att: {
    shared_plan_total: number;
    line_totals: Record<Person, number>;
  };
  recurring: Record<(typeof EQUAL_BILL_KEYS)[number], number>;
};

export function computeMonthlyOwed(input: ReportInput): Record<Person, number> {
  const sharedSplit = splitEqualWithRotation(input.att.shared_plan_total, input.month);
  const totals = Object.fromEntries(ROSTER.map((p) => [p, 0])) as Record<Person, number>;

  for (const person of ROSTER) {
    totals[person] = Number((totals[person] + input.att.line_totals[person] + sharedSplit[person]).toFixed(2));
  }

  for (const key of EQUAL_BILL_KEYS) {
    const split = splitEqualWithRotation(input.recurring[key], input.month);
    for (const person of ROSTER) {
      totals[person] = Number((totals[person] + split[person]).toFixed(2));
    }
  }

  return totals;
}

export async function buildWorkbookBuffer(input: ReportInput): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('Monthly Report');
  const totals = computeMonthlyOwed(input);

  ws.addRow(['Month', input.month]);
  ws.addRow([]);
  ws.addRow(['Person', 'Amount Owed to Errol']);
  for (const person of ROSTER) {
    ws.addRow([person, totals[person]]);
  }

  ws.addRow([]);
  ws.addRow(['AT&T Shared Plan Total', input.att.shared_plan_total]);
  for (const person of ROSTER) {
    ws.addRow([`AT&T Line - ${person}`, input.att.line_totals[person]]);
  }

  for (const key of EQUAL_BILL_KEYS) {
    ws.addRow([key, input.recurring[key]]);
  }

  ws.getColumn(1).width = 28;
  ws.getColumn(2).width = 20;

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
