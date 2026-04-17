import { useState, useEffect } from 'react';
import { Recipe, RecipeWithIngredients, CreateRecipeInput } from '../models/Recipe';
import { useRecipes } from '../hooks/useRecipes';
import { recipeApi } from '../services/recipeApi';
import RecipeList from '../components/recipes/RecipeList';
import RecipeForm from '../components/recipes/RecipeForm';
import Modal from '../components/shared/Modal';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorBanner from '../components/shared/ErrorBanner';

type ModalState =
  | { mode: 'create' }
  | { mode: 'edit'; recipe: Recipe }
  | null;

export default function RecipesPage() {
  const { recipes, isLoading, error, create, remove, refetch } = useRecipes();
  const [modal, setModal]               = useState<ModalState>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError]   = useState<string | null>(null);

  const closeModal = () => {
    setModal(null);
    setSubmitError(null);
  };

  const handleCreate = async (data: CreateRecipeInput) => {
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

  const handleUpdate = async (data: CreateRecipeInput) => {
    if (modal?.mode !== 'edit') return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await recipeApi.updateMeta(modal.recipe.id, {
        name: data.name,
        description: data.description,
        diners: data.diners,
      });
      await recipeApi.replaceIngredients(modal.recipe.id, data.ingredients);
      await refetch();
      closeModal();
    } catch (err) {
      setSubmitError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await remove(id);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div className="space-y-4">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Recetas</h1>
        <button onClick={() => setModal({ mode: 'create' })} className="btn-primary">
          + Nueva receta
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <RecipeList
          recipes={recipes}
          onEdit={(recipe) => setModal({ mode: 'edit', recipe })}
          onDelete={(id) => { void handleDelete(id); }}
        />
      )}

      {/* Modal crear / editar */}
      <Modal
        isOpen={modal !== null}
        title={modal?.mode === 'create' ? 'Nueva receta' : 'Editar receta'}
        onClose={closeModal}
        size="lg"
      >
        <div className="space-y-4">
          {submitError && (
            <ErrorBanner message={submitError} onDismiss={() => setSubmitError(null)} />
          )}
          {modal?.mode === 'create' && (
            <RecipeForm
              onSubmit={handleCreate}
              onCancel={closeModal}
              isSubmitting={isSubmitting}
            />
          )}
          {modal?.mode === 'edit' && (
            <RecipeFormWithData
              recipeId={modal.recipe.id}
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

// Carga los datos completos de la receta (con ingredientes) antes de mostrar el form de edición
function RecipeFormWithData({
  recipeId, onSubmit, onCancel, isSubmitting,
}: {
  recipeId: number;
  onSubmit: (data: CreateRecipeInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [data, setData]         = useState<RecipeWithIngredients | null>(null);
  const [loading, setLoading]   = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    recipeApi.getById(recipeId)
      .then(setData)
      .catch((err: Error) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, [recipeId]);

  if (loading) {
    return <div className="flex justify-center py-6"><LoadingSpinner /></div>;
  }
  if (loadError) {
    return <ErrorBanner message={loadError} />;
  }
  if (!data) return null;

  return (
    <RecipeForm
      initialData={data}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
    />
  );
}
