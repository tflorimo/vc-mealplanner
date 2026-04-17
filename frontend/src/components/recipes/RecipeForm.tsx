import { useState } from 'react';
import { RecipeWithIngredients, CreateRecipeInput } from '../../models/Recipe';
import { Ingredient } from '../../models/Ingredient';
import IngredientRow, { rowToInput } from './IngredientRow';
import ErrorBanner from '../shared/ErrorBanner';

type RowState = { ingredient: Ingredient | null; quantity: string; unit: string };

const emptyRow = (): RowState => ({ ingredient: null, quantity: '', unit: 'kg' });

interface RecipeFormProps {
  initialData?: RecipeWithIngredients;
  onSubmit: (data: CreateRecipeInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function RecipeForm({ initialData, onSubmit, onCancel, isSubmitting }: RecipeFormProps) {
  const [name, setName]         = useState(initialData?.name ?? '');
  const [description, setDesc]  = useState(initialData?.description ?? '');
  const [diners, setDiners]     = useState(initialData?.diners ?? 2);
  const [rows, setRows]         = useState<RowState[]>(
    initialData?.ingredients.length
      ? initialData.ingredients.map((i) => ({
          ingredient: { id: i.ingredient_id, name: i.ingredient_name, unit: i.base_unit, is_pantry: false, created_at: '', updated_at: '' },
          quantity: String(i.quantity),
          unit: i.unit,
        }))
      : [emptyRow()],
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);

  const updateRow = (index: number, updated: RowState) => {
    setRows((prev) => prev.map((r, i) => (i === index ? updated : r)));
  };

  const removeRow = (index: number) => {
    setRows((prev) => prev.length === 1 ? [emptyRow()] : prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!name.trim()) { setValidationError('El nombre de la receta es requerido.'); return; }

    const ingredients = rows.map(rowToInput).filter((r): r is NonNullable<typeof r> => r !== null);

    if (ingredients.length === 0) {
      setValidationError('La receta debe tener al menos un ingrediente completo.');
      return;
    }

    const incompleteRows = rows.filter((r) => r.ingredient !== null && rowToInput(r) === null);
    if (incompleteRows.length > 0) {
      setValidationError('Hay filas de ingredientes incompletas. Completalas o eliminalas.');
      return;
    }

    await onSubmit({
      name: name.trim(),
      description: description.trim() || null,
      diners,
      ingredients,
    });
  };

  return (
    <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-5">
      {validationError && <ErrorBanner message={validationError} onDismiss={() => setValidationError(null)} />}

      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Milanesas con puré"
          className="input-base"
          maxLength={200}
        />
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDesc(e.target.value)}
          rows={2}
          placeholder="Notas opcionales..."
          className="input-base resize-none"
        />
      </div>

      {/* Comensales */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Comensales</label>
        <input
          type="number"
          value={diners}
          onChange={(e) => setDiners(Math.max(1, Number(e.target.value)))}
          min={1} max={20}
          className="input-base w-24"
        />
      </div>

      {/* Ingredientes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ingredientes *
          <span className="text-xs text-gray-400 ml-2">Solo del maestro de ingredientes</span>
        </label>
        <div className="space-y-2">
          {rows.map((row, i) => (
            <IngredientRow key={i} value={row} onChange={(u) => updateRow(i, u)} onRemove={() => removeRow(i)} />
          ))}
        </div>
        <button
          type="button"
          onClick={addRow}
          className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          + Agregar ingrediente
        </button>
      </div>

      {/* Acciones */}
      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Guardando...' : initialData ? 'Guardar cambios' : 'Crear receta'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancelar
        </button>
      </div>
    </form>
  );
}
