import { describe, expect, it } from 'vitest';
import { formatDate, formatMoney } from './format';

describe('formatMoney', () => {
  it('formats with two decimals and a symbol', () => {
    expect(formatMoney(2180, 'AU$')).toBe('AU$2,180.00');
  });

  it('handles zero and missing symbol', () => {
    expect(formatMoney(0)).toBe('0.00');
  });
});

describe('formatDate', () => {
  it('formats an ISO date string', () => {
    expect(formatDate('2026-06-03')).toMatch(/2026/);
  });

  it('returns a dash for empty input', () => {
    expect(formatDate(undefined)).toBe('-');
  });
});
