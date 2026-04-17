// Helpers para manejo de fechas. Todas las fechas se trabajan en UTC.

// Retorna el primer y último día de un mes dado como strings 'YYYY-MM-DD'
export function getMonthRange(year: number, month: number): { dateFrom: string; dateTo: string } {
  const dateFrom = new Date(Date.UTC(year, month - 1, 1));
  const dateTo = new Date(Date.UTC(year, month, 0)); // día 0 del mes siguiente = último del actual

  return {
    dateFrom: formatDate(dateFrom),
    dateTo: formatDate(dateTo),
  };
}

// Formatea una Date a string 'YYYY-MM-DD'
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0] as string;
}

// Parsea 'YYYY-MM' y retorna { year, month }
export function parseYearMonth(yearMonth: string): { year: number; month: number } {
  const parts = yearMonth.split('-');
  if (parts.length !== 2) {
    throw new Error(`Formato de mes inválido: '${yearMonth}'. Se esperaba 'YYYY-MM'.`);
  }
  const year = parseInt(parts[0] as string, 10);
  const month = parseInt(parts[1] as string, 10);

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    throw new Error(`Mes inválido: '${yearMonth}'.`);
  }

  return { year, month };
}
