import { describe, expect, it } from 'vitest';
import { computeMonthlyOwed } from '@/lib/report';

describe('computeMonthlyOwed', () => {
  it('computes deterministic monthly owed totals', () => {
    const totals = computeMonthlyOwed({
      month: '2026-01',
      att: {
        shared_plan_total: 120,
        line_totals: {
          Errol: 40,
          Azira: 40,
          Mark: 30,
          John: 30,
          Zach: 35,
          Michelle: 25
        }
      },
      recurring: {
        fiber: 60,
        waterIndoor: 45,
        waterOutdoor: 15,
        electricity: 90,
        naturalGas: 75,
        netflix: 30
      }
    });

    expect(totals).toEqual({
      Errol: 95,
      Azira: 95,
      Mark: 85,
      John: 85,
      Zach: 90,
      Michelle: 80
    });
  });
});
