import { useState } from 'react';
import { DateRangePicker } from '../components/shopping/DateRangePicker';
import { ShoppingListOutput } from '../components/shopping/ShoppingListOutput';
import { useShopping } from '../hooks/useShopping';

function getDefaultRange(): { from: string; to: string } {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { from: fmt(first), to: fmt(last) };
}

export function ShoppingPage() {
  const defaults = getDefaultRange();
  const [dateFrom, setDateFrom] = useState(defaults.from);
  const [dateTo, setDateTo]     = useState(defaults.to);
  const [saveList, setSaveList] = useState(false);

  const { items, savedList, loading, error, lastRange, calculate } = useShopping();

  const handleCalculate = () => {
    if (!dateFrom || !dateTo) return;
    calculate(dateFrom, dateTo, saveList);
  };

  const canCalculate = dateFrom && dateTo && dateFrom <= dateTo && !loading;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Lista de Compras</h1>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 space-y-4">
        <DateRangePicker
          dateFrom={dateFrom}
          dateTo={dateTo}
          onFromChange={setDateFrom}
          onToChange={setDateTo}
        />

        <div className="flex items-center gap-4 flex-wrap">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={saveList}
              onChange={e => setSaveList(e.target.checked)}
              className="rounded"
            />
            Guardar esta lista
          </label>

          <button
            onClick={handleCalculate}
            disabled={!canCalculate}
            className="px-5 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium
                       hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Calculando...' : 'Calcular'}
          </button>
        </div>
      </div>

      <ShoppingListOutput
        items={items}
        savedList={savedList}
        loading={loading}
        error={error}
        lastRange={lastRange}
      />
    </div>
  );
}
