import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RecipeWithIngredients, CreateRecipeInput } from '../models/Recipe';
import { recipeApi } from '../services/recipeApi';
import RecipeForm from '../components/recipes/RecipeForm';
import Modal from '../components/shared/Modal';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorBanner from '../components/shared/ErrorBanner';

export default function RecipeDetailPage() {
  const { id }       = useParams<{ id: string }>();
  const navigate     = useNavigate();
  const recipeId     = Number(id);

  const [recipe, setRecipe]         = useState<RecipeWithIngredients | null>(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [editOpen, setEditOpen]     = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError]   = useState<string | null>(null);

  const fetchRecipe = () => {
    setIsLoading(true);
    setError(null);
    recipeApi.getById(recipeId)
      .then(setRecipe)
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchRecipe(); }, [recipeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpdate = async (data: CreateRecipeInput) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await recipeApi.updateMeta(recipeId, {
        name: data.name,
        description: data.description,
        diners: data.diners,
      });
      await recipeApi.replaceIngredients(recipeId, data.ingredients);
      fetchRecipe();
      setEditOpen(false);
    } catch (err) {
      setSubmitError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><LoadingSpinner /></div>;
  }
  if (error) {
    return (
      <div className="space-y-4">
        <ErrorBanner message={error} />
        <button onClick={() => navigate('/recipes')} className="btn-secondary">
          ← Volver a recetas
        </button>
      </div>
    );
  }
  if (!recipe) return null;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/recipes')}
            className="text-sm text-gray-400 hover:text-gray-600 mb-2 inline-flex items-center gap-1"
          >
            ← Recetas
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{recipe.name}</h1>
          {recipe.description && (
            <p className="text-gray-500 mt-1">{recipe.description}</p>
          )}
          <p className="text-sm text-gray-400 mt-1">
            Para {recipe.diners} comensal{recipe.diners !== 1 ? 'es' : ''}
          </p>
        </div>
        <button onClick={() => setEditOpen(true)} className="btn-primary shrink-0">
          Editar
        </button>
      </div>

      {/* Ingredientes */}
      <div>
        <h2 className="text-base font-semibold text-gray-700 mb-3">Ingredientes</h2>
        {recipe.ingredients.length === 0 ? (
          <p className="text-gray-400 text-sm">Sin ingredientes registrados.</p>
        ) : (
          <ul className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
            {recipe.ingredients.map((ing) => (
              <li key={ing.id} className="flex items-center justify-between px-4 py-2.5 bg-white">
                <span className="text-sm font-medium text-gray-800">{ing.ingredient_name}</span>
                <span className="text-sm text-gray-500">
                  {ing.quantity} {ing.unit}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal de edición */}
      <Modal
        isOpen={editOpen}
        title="Editar receta"
        onClose={() => { setEditOpen(false); setSubmitError(null); }}
        size="lg"
      >
        <div className="space-y-4">
          {submitError && (
            <ErrorBanner message={submitError} onDismiss={() => setSubmitError(null)} />
          )}
          <RecipeForm
            initialData={recipe}
            onSubmit={handleUpdate}
            onCancel={() => { setEditOpen(false); setSubmitError(null); }}
            isSubmitting={isSubmitting}
          />
        </div>
      </Modal>
    </div>
  );
}
