import { MealSlotWithDetails, SlotType } from '../../models/MealSlot';
import { MONTH_LABELS, DAY_LABELS, buildCalendarWeeks } from '../../utils/dateHelpers';
import DayCell from './DayCell';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorBanner from '../shared/ErrorBanner';

interface MonthlyCalendarProps {
  year: number;
  month: number;
  slotMap: Map<string, MealSlotWithDetails>;
  isLoading: boolean;
  error: string | null;
  updatingSlots: Set<string>;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSlotClick: (date: string, slotType: SlotType) => void;
  onFastingToggle: (date: string, slotType: SlotType, isFasting: boolean) => void;
}

export default function MonthlyCalendar({
  year, month, slotMap, isLoading, error,
  updatingSlots, onPrevMonth, onNextMonth,
  onSlotClick, onFastingToggle,
}: MonthlyCalendarProps) {
  const weeks = buildCalendarWeeks(year, month);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Cabecera con navegación */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button
          onClick={onPrevMonth}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 text-lg leading-none"
          aria-label="Mes anterior"
        >
          ‹
        </button>

        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-gray-900 capitalize">
            {MONTH_LABELS[month - 1]} {year}
          </h2>
          {isLoading && <LoadingSpinner size="sm" />}
        </div>

        <button
          onClick={onNextMonth}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 text-lg leading-none"
          aria-label="Mes siguiente"
        >
          ›
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      {/* ── Desktop: grilla 7 columnas ── */}
      <div className="hidden sm:block">
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
          {DAY_LABELS.map((label) => (
            <div
              key={label}
              className="py-2 text-center text-xs font-medium text-gray-400 uppercase tracking-wide"
            >
              {label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {weeks.map((week, wi) =>
            week.map((date, di) => (
              <DayCell
                key={`${wi}-${di}`}
                date={date}
                isCurrentMonth={date.getMonth() + 1 === month}
                slotMap={slotMap}
                updatingSlots={updatingSlots}
                onSlotClick={onSlotClick}
                onFastingToggle={onFastingToggle}
              />
            )),
          )}
        </div>
      </div>

      {/* ── Mobile: lista vertical (solo días del mes actual) ── */}
      <div className="sm:hidden divide-y divide-gray-100">
        {weeks.flat().filter(date => date.getMonth() + 1 === month).map((date) => (
          <DayCell
            key={date.toISOString()}
            date={date}
            isCurrentMonth={true}
            slotMap={slotMap}
            updatingSlots={updatingSlots}
            onSlotClick={onSlotClick}
            onFastingToggle={onFastingToggle}
          />
        ))}
      </div>
    </div>
  );
}
