// Date filter utilities for KPIs and API routes

export function getDateRange(range) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (range) {
    case '7d':
      return {
        start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        end: now,
      };
    case '30d':
      return {
        start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        end: now,
      };
    case 'today':
    default:
      return {
        start: today,
        end: now,
      };
  }
}

export function formatDateForAirtable(date) {
  return date.toISOString().split('T')[0];
}

export function buildDateFilter(fieldName, range, customStart, customEnd) {
  if (range === 'custom' && customStart && customEnd) {
    return `AND(IS_AFTER({${fieldName}}, '${customStart}'), IS_BEFORE({${fieldName}}, '${customEnd}'))`;
  }

  const { start, end } = getDateRange(range);
  const startStr = formatDateForAirtable(start);
  const endStr = formatDateForAirtable(end);

  if (range === 'today') {
    return `IS_SAME({${fieldName}}, '${startStr}', 'day')`;
  }

  return `AND(IS_AFTER({${fieldName}}, '${startStr}'), IS_BEFORE({${fieldName}}, '${endStr}'))`;
}

export function isToday(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  return date.toISOString().split('T')[0] === today.toISOString().split('T')[0];
}

export function isInRange(dateString, range, customStart, customEnd) {
  if (!dateString) return false;
  const date = new Date(dateString);

  if (range === 'custom' && customStart && customEnd) {
    return date >= new Date(customStart) && date <= new Date(customEnd);
  }

  const { start, end } = getDateRange(range);
  return date >= start && date <= end;
}
