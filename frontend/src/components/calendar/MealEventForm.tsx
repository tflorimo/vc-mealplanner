import { useState } from 'react';
import { Ingredient } from '../../models/Ingredient';
import { CreateMealEventInput, EventIngredientInput } from '../../models/MealEvent';
import IngredientRow, { rowToInput } from '../recipes/IngredientRow';
import ErrorBanner from '../shared/ErrorBanner';

type RowState = { ingredient: Ingredient | null; quantity: string; unit: string };

const emptyRow = (): RowState => ({ ingredient: null, quantity: '', unit: 'kg' });

interface MealEventFormProps {
  onSubmit: (data: CreateMealEventInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function MealEventForm({ onSubmit, onCancel, isSubmitting }: MealEventFormProps) {
  const [name, setName]   = useState('');
  const [rows, setRows]   = useState<RowState[]>([emptyRow()]);
  const [error, setError] = useState<string | null>(null);

  const addRow    = () => setRows((prev) => [...prev, emptyRow()]);
  const updateRow = (i: number, updated: RowState) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? updated : r)));
  const removeRow = (i: number) =>
    setRows((prev) => prev.length === 1 ? [emptyRow()] : prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) { setError('El nombre del evento es requerido.'); return; }

    const ingredients = rows
      .map(rowToInput)
      .filter((r): r is EventIngredientInput => r !== null);

    if (ingredients.length === 0) {
      setError('El evento debe tener al menos un ingrediente completo.');
      return;
    }

    const incomplete = rows.filter((r) => r.ingredient !== null && rowToInput(r) === null);
    if (incomplete.length > 0) {
      setError('Hay filas de ingredientes incompletas.');
      return;
    }

    await onSubmit({ name: name.trim(), description: null, ingredients });
  };

  return (
    <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-3 mt-2">
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Nombre del evento *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Cena navideña"
          className="input-base"
          maxLength={200}
          autoFocus
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Ingredientes *</label>
        <div className="space-y-2">
          {rows.map((row, i) => (
            <IngredientRow
              key={i}
              value={row}
              onChange={(u) => updateRow(i, u)}
              onRemove={() => removeRow(i)}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={addRow}
          className="mt-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium"
        >
          + Agregar ingrediente
        </button>
      </div>

      <div className="flex gap-2 pt-2 border-t border-gray-100">
        <button type="submit" disabled={isSubmitting} className="btn-primary text-sm py-1.5">
          {isSubmitting ? 'Creando...' : 'Crear y asignar'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary text-sm py-1.5">
          Cancelar
        </button>
      </div>
    </form>
  );
}
