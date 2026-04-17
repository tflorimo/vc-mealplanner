// Semanas empiezan en lunes (convención Argentina/LatAm)
export const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export const MONTH_LABELS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

// Formatea year+month a 'YYYY-MM' para el query param de la API
export function formatYearMonth(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

// Formatea una Date a 'YYYY-MM-DD' (fecha local, sin TZ shift)
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Retorna 0=Lun..6=Dom (en lugar del 0=Dom de JavaScript)
function dayOfWeekMon(date: Date): number {
  return (date.getDay() + 6) % 7;
}

// Construye la grilla del calendario: array de semanas, cada semana es array de 7 Dates.
// Días del mes anterior/siguiente para completar las filas.
export function buildCalendarWeeks(year: number, month: number): Date[][] {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay  = new Date(year, month, 0);
  const weeks: Date[][] = [];
  let week: Date[] = [];

  // Días previos del mes anterior para completar la primera semana
  const leadingDays = dayOfWeekMon(firstDay);
  for (let i = leadingDays - 1; i >= 0; i--) {
    week.push(new Date(year, month - 1, -i));
  }

  // Días del mes actual
  for (let d = 1; d <= lastDay.getDate(); d++) {
    week.push(new Date(year, month - 1, d));
    if (week.length === 7) { weeks.push(week); week = []; }
  }

  // Días siguientes para completar la última semana
  let nextDay = 1;
  while (week.length > 0 && week.length < 7) {
    week.push(new Date(year, month, nextDay++));
  }
  if (week.length > 0) weeks.push(week);

  return weeks;
}

// Verifica si una Date es el día de hoy
export function isToday(date: Date): boolean {
  const today = new Date();
  return date.getFullYear() === today.getFullYear()
    && date.getMonth() === today.getMonth()
    && date.getDate() === today.getDate();
}

// Navega al mes anterior/siguiente
export function prevMonth(year: number, month: number): { year: number; month: number } {
  return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
}

export function nextMonth(year: number, month: number): { year: number; month: number } {
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
}
