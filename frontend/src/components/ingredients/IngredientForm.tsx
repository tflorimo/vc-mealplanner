import { useState } from 'react';
import { Ingredient, CreateIngredientInput } from '../../models/Ingredient';
import ErrorBanner from '../shared/ErrorBanner';

const UNITS = ['kg', 'g', 'L', 'ml', 'u'] as const;

interface IngredientFormProps {
  initialData?: Ingredient;
  onSubmit: (data: CreateIngredientInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function IngredientForm({
  initialData, onSubmit, onCancel, isSubmitting,
}: IngredientFormProps) {
  const [name, setName]         = useState(initialData?.name ?? '');
  const [unit, setUnit]         = useState(initialData?.unit ?? 'kg');
  const [isPantry, setIsPantry] = useState(initialData?.is_pantry ?? false);
  const [error, setError]       = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) { setError('El nombre es requerido.'); return; }
    await onSubmit({ name: name.trim(), unit, is_pantry: isPantry });
  };

  return (
    <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Harina"
          className="input-base"
          maxLength={100}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Unidad base</label>
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="input-base w-32"
        >
          {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
        <p className="text-xs text-gray-400 mt-1">
          Unidad en la que comprás este ingrediente habitualmente.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_pantry"
          checked={isPantry}
          onChange={(e) => setIsPantry(e.target.checked)}
          className="w-4 h-4 rounded accent-primary-600"
        />
        <label htmlFor="is_pantry" className="text-sm text-gray-700 cursor-pointer">
          Despensa{' '}
          <span className="text-gray-400 text-xs">(no aparece en la lista de compras)</span>
        </label>
      </div>

      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Guardando...' : initialData ? 'Guardar cambios' : 'Crear ingrediente'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancelar
        </button>
      </div>
    </form>
  );
}
