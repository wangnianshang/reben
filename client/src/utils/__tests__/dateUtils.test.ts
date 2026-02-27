import { describe, it, expect } from 'vitest';
import { parseDateInput } from '../dateUtils';

describe('dateUtils', () => {
  it('parses YYYY-MM-DD correctly', () => {
    expect(parseDateInput('2023-05-20')).toBe('2023-05-20');
  });

  it('parses YYYY-MM correctly (defaults to 1st)', () => {
    expect(parseDateInput('2023-06')).toBe('2023-06-01');
  });

  it('parses M月 correctly (current year)', () => {
    const currentYear = new Date().getFullYear();
    expect(parseDateInput('6月')).toBe(`${currentYear}-06-01`);
  });

  it('parses M.D correctly', () => {
    const currentYear = new Date().getFullYear();
    expect(parseDateInput('6.1')).toBe(`${currentYear}-06-01`);
  });

  it('returns null for invalid date', () => {
    expect(parseDateInput('invalid')).toBe(null);
  });
});
