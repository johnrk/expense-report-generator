export const ROSTER = ['Errol', 'Azira', 'Mark', 'John', 'Zach', 'Michelle'] as const;
export type Person = (typeof ROSTER)[number];

export const EQUAL_BILL_KEYS = [
  'fiber',
  'waterIndoor',
  'waterOutdoor',
  'electricity',
  'naturalGas',
  'netflix'
] as const;

export type EqualBillKey = (typeof EQUAL_BILL_KEYS)[number];
