import { Person, ROSTER } from './constants';

export function parseMonth(month: string): { year: number; monthNum: number } {
  const match = month.match(/^(\d{4})-(\d{2})$/);
  if (!match) {
    throw new Error('month must be in YYYY-MM format');
  }
  const year = Number(match[1]);
  const monthNum = Number(match[2]);
  if (monthNum < 1 || monthNum > 12) {
    throw new Error('month must be in YYYY-MM format');
  }
  return { year, monthNum };
}

export function splitEqualWithRotation(total: number, month: string): Record<Person, number> {
  const { year, monthNum } = parseMonth(month);
  const centsTotal = Math.round(total * 100);
  const baseCents = Math.floor(centsTotal / ROSTER.length);
  const remainder = centsTotal - baseCents * ROSTER.length;
  const monthIndex = (year * 12 + monthNum) % ROSTER.length;

  const result = Object.fromEntries(
    ROSTER.map((name) => [name, baseCents / 100])
  ) as Record<Person, number>;

  for (let i = 0; i < remainder; i += 1) {
    const idx = (monthIndex + i) % ROSTER.length;
    const person = ROSTER[idx];
    result[person] = Number((result[person] + 0.01).toFixed(2));
  }

  return result;
}
