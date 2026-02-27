import { format, isValid, parse, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const parseDateInput = (input: string): string | null => {
  if (!input) return null;

  const now = new Date();
  const currentYear = now.getFullYear();

  // Try standard YYYY-MM-DD
  let date = parseISO(input);
  if (isValid(date) && input.includes('-')) return format(date, 'yyyy-MM-dd');

  // Try "2023-06" (YYYY-MM) -> 1st of month
  if (/^\d{4}-\d{1,2}$/.test(input)) {
      date = parse(input, 'yyyy-MM', new Date());
      if (isValid(date)) return format(date, 'yyyy-MM-dd');
  }

  // Try "6月" (M月) -> current year, 1st of month
  if (/^\d{1,2}月$/.test(input)) {
      date = parse(input, 'M月', new Date());
      date.setFullYear(currentYear); // parse might default to epoch year
      if (isValid(date)) return format(date, 'yyyy-MM-dd');
  }

  // Try "6.1" or "6/1"
  if (/^\d{1,2}[./]\d{1,2}$/.test(input)) {
      const parts = input.split(/[./]/);
      date = new Date(currentYear, parseInt(parts[0]) - 1, parseInt(parts[1]));
      if (isValid(date)) return format(date, 'yyyy-MM-dd');
  }

  return null;
};

export const formatDateForDisplay = (isoString: string): string => {
    return format(parseISO(isoString), 'yyyy-MM-dd HH:mm', { locale: zhCN });
};
