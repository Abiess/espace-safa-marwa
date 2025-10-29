export function formatCurrency(amount: number, locale: string = 'fr-MA'): string {
  return new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + ' MAD';
}

export function formatNumber(value: number, locale: string = 'fr-MA'): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  }).format(value);
}

export function parseNumber(value: string): number | null {
  const normalized = value
    .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1632 + 48))
    .replace(/,/g, '.')
    .replace(/\s/g, '');

  const num = parseFloat(normalized);
  return isNaN(num) ? null : num;
}

export function toArabicNumerals(value: string): string {
  return value.replace(/[0-9]/g, (d) => String.fromCharCode(d.charCodeAt(0) + 1632 - 48));
}

export function toLatinNumerals(value: string): string {
  return value.replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1632 + 48));
}

export function formatDate(date: string | Date, locale: string = 'fr-MA'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatDateShort(date: string | Date, locale: string = 'fr-MA'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

export function isRTL(text: string): boolean {
  const arabicPattern = /[\u0600-\u06FF]/;
  return arabicPattern.test(text);
}
