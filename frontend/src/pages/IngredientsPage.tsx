import { useState } from 'react';
import { Ingredient, CreateIngredientInput } from '../models/Ingredient';
import { useIngredients } from '../hooks/useIngredients';
import IngredientForm from '../components/ingredients/IngredientForm';
import Modal from '../components/shared/Modal';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorBanner from '../components/shared/ErrorBanner';

type ModalState =
  | { mode: 'create' }
  | { mode: 'edit'; ingredient: Ingredient }
  | null;

export default function IngredientsPage() {
  const { ingredients, isLoading, error, create, update, remove } = useIngredients();
  const [modal, setModal]               = useState<ModalState>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError]   = useState<string | null>(null);
  const [search, setSearch]             = useState('');

  const closeModal = () => {
    setModal(null);
    setSubmitError(null);
  };

  const handleCreate = async (data: CreateIngredientInput) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await create(data);
      closeModal();
    } catch (err) {
      setSubmitError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: CreateIngredientInput) => {
    if (modal?.mode !== 'edit') return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await update(modal.ingredient.id, data);
      closeModal();
    } catch (err) {
      setSubmitError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (ingredient: Ingredient) => {
    if (!window.confirm(`¿Eliminar "${ingredient.name}"? Se quitará de todas las recetas que lo usen.`)) return;
    try {
      await remove(ingredient.id);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const filtered = search.trim()
    ? ingredients.filter((i) => i.name.toLowerCase().includes(search.trim().toLowerCase()))
    : ingredients;

  return (
    <div className="space-y-4">
      {/* Cabecera */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-gray-900">Ingredientes</h1>
        <button onClick={() => setModal({ mode: 'create' })} className="btn-primary shrink-0">
          + Nuevo ingrediente
        </button>
      </div>

      {/* Búsqueda */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar ingrediente..."
        className="input-base"
      />

      {error && <ErrorBanner message={error} />}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          {ingredients.length === 0
            ? <><p className="text-lg">No hay ingredientes todavía.</p><p className="text-sm mt-1">Creá el primero con el botón de arriba.</p></>
            : <p>Sin resultados para "{search}".</p>
          }
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-2.5 font-medium text-gray-500">Nombre</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-500">Unidad</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-500">Despensa</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((ing) => (
                <tr key={ing.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-gray-800">{ing.name}</td>
                  <td className="px-4 py-2.5 text-gray-500">{ing.unit}</td>
                  <td className="px-4 py-2.5">
                    {ing.is_pantry && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                        despensa
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setModal({ mode: 'edit', ingredient: ing })}
                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                        aria-label={`Editar ${ing.name}`}
                        title="Editar"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => { void handleDelete(ing); }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        aria-label={`Eliminar ${ing.name}`}
                        title="Eliminar"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2 border-t border-gray-50 text-xs text-gray-400">
            {filtered.length} ingrediente{filtered.length !== 1 ? 's' : ''}
            {search.trim() && ` encontrado${filtered.length !== 1 ? 's' : ''}`}
          </div>
        </div>
      )}

      {/* Modal crear / editar */}
      <Modal
        isOpen={modal !== null}
        title={modal?.mode === 'create' ? 'Nuevo ingrediente' : 'Editar ingrediente'}
        onClose={closeModal}
        size="sm"
      >
        <div className="space-y-4">
          {submitError && (
            <ErrorBanner message={submitError} onDismiss={() => setSubmitError(null)} />
          )}
          {modal?.mode === 'create' && (
            <IngredientForm
              onSubmit={handleCreate}
              onCancel={closeModal}
              isSubmitting={isSubmitting}
            />
          )}
          {modal?.mode === 'edit' && (
            <IngredientForm
              initialData={modal.ingredient}
              onSubmit={handleUpdate}
              onCancel={closeModal}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
