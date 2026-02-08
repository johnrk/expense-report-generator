import { describe, expect, it } from 'vitest';
import { splitEqualWithRotation } from '@/lib/split';

describe('splitEqualWithRotation', () => {
  it('rotates remainder pennies based on month index', () => {
    const result = splitEqualWithRotation(10, '2026-01');
    expect(result).toEqual({
      Errol: 1.67,
      Azira: 1.66,
      Mark: 1.66,
      John: 1.67,
      Zach: 1.67,
      Michelle: 1.67
    });
  });

  it('keeps totals exact to cents', () => {
    const result = splitEqualWithRotation(125.55, '2026-11');
    const total = Object.values(result).reduce((acc, n) => acc + n, 0);
    expect(Number(total.toFixed(2))).toBe(125.55);
  });
});
