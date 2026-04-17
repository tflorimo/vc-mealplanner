interface DateRangePickerProps {
  dateFrom: string;
  dateTo: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
}

function getMonthRange(offset: number): { from: string; to: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + offset;
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { from: fmt(first), to: fmt(last) };
}

export function DateRangePicker({ dateFrom, dateTo, onFromChange, onToChange }: DateRangePickerProps) {
  const applyPreset = (offset: number) => {
    const { from, to } = getMonthRange(offset);
    onFromChange(from);
    onToChange(to);
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">Desde</label>
        <input
          type="date"
          value={dateFrom}
          onChange={e => onFromChange(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">Hasta</label>
        <input
          type="date"
          value={dateTo}
          min={dateFrom}
          onChange={e => onToChange(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="flex gap-2 pb-0.5">
        <button
          type="button"
          onClick={() => applyPreset(0)}
          className="text-xs px-3 py-2 rounded border border-primary-500 text-primary-600 hover:bg-primary-50 transition-colors"
        >
          Este Mes
        </button>
        <button
          type="button"
          onClick={() => applyPreset(1)}
          className="text-xs px-3 py-2 rounded border border-primary-500 text-primary-600 hover:bg-primary-50 transition-colors"
        >
          Próximo Mes
        </button>
      </div>
    </div>
  );
}
