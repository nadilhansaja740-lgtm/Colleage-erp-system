import { Language, Product, DateRange } from '../types';

export function formatCurrency(amount: number, lang: Language = 'en'): string {
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return lang === 'si' ? `රු. ${formatted}` : `LKR ${formatted}`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}

export function isLowStock(product: Product): boolean {
  return product.stock > 0 && product.stock <= product.minStockLevel;
}

export function isOutOfStock(product: Product): boolean {
  return product.stock <= 0;
}

export function filterByDateRange<T extends { date: string }>(
  items: T[],
  range: DateRange
): T[] {
  const todayStr = new Date().toISOString().split('T')[0];

  if (range.preset === 'today') {
    return items.filter((item) => item.date === todayStr);
  }

  if (range.preset === 'yesterday') {
    const yest = new Date();
    yest.setDate(yest.getDate() - 1);
    const yestStr = yest.toISOString().split('T')[0];
    return items.filter((item) => item.date === yestStr);
  }

  if (range.preset === 'week') {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startStr = startOfWeek.toISOString().split('T')[0];
    return items.filter((item) => item.date >= startStr && item.date <= todayStr);
  }

  if (range.preset === 'month') {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startStr = startOfMonth.toISOString().split('T')[0];
    return items.filter((item) => item.date >= startStr && item.date <= todayStr);
  }

  if (range.preset === 'year') {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startStr = startOfYear.toISOString().split('T')[0];
    return items.filter((item) => item.date >= startStr && item.date <= todayStr);
  }

  if (range.preset === 'custom' && range.startDate && range.endDate) {
    return items.filter(
      (item) => item.date >= range.startDate && item.date <= range.endDate
    );
  }

  return items;
}
