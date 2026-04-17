import { useState, useRef, useEffect } from 'react';
import { Ingredient } from '../../models/Ingredient';
import { useIngredientSearch } from '../../hooks/useIngredients';
import LoadingSpinner from '../shared/LoadingSpinner';

interface IngredientAutocompleteProps {
  value: Ingredient | null;
  onChange: (ingredient: Ingredient | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

// Componente crítico: enforza que el ingrediente SIEMPRE provenga del maestro.
// El usuario no puede guardar texto libre — solo selecciones del dropdown.
export default function IngredientAutocomplete({
  value,
  onChange,
  placeholder = 'Buscar ingrediente...',
  disabled = false,
}: IngredientAutocompleteProps) {
  const [query, setQuery]       = useState(value?.name ?? '');
  const [isOpen, setIsOpen]     = useState(false);
  const containerRef            = useRef<HTMLDivElement>(null);
  const { results, isLoading }  = useIngredientSearch(query);

  // Sincronizar si el valor externo cambia
  useEffect(() => { setQuery(value?.name ?? ''); }, [value]);

  // Cerrar al clickear afuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        // Si el usuario no seleccionó nada válido, limpiar el campo
        if (!value || query !== value.name) {
          setQuery(value?.name ?? '');
        }
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [value, query]);

  const handleSelect = (ingredient: Ingredient) => {
    onChange(ingredient);
    setQuery(ingredient.name);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onChange(null); // invalida la selección actual mientras escribe
    setIsOpen(true);
  };

  const handleClear = () => {
    setQuery('');
    onChange(null);
    setIsOpen(false);
  };

  const showDropdown = isOpen && query.trim().length > 0;

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => { if (query) setIsOpen(true); }}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className={`input-base pr-8 ${value ? 'border-green-400 bg-green-50' : ''}`}
        />
        {query && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Limpiar"
          >
            ✕
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500">
              <LoadingSpinner size="sm" /> Buscando...
            </div>
          )}
          {!isLoading && results.length === 0 && (
            <p className="px-3 py-2 text-sm text-gray-500">
              No se encontraron ingredientes con "{query}".
            </p>
          )}
          {results.map((ingredient) => (
            <button
              key={ingredient.id}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleSelect(ingredient); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between gap-2"
            >
              <span className="font-medium text-gray-900">{ingredient.name}</span>
              <span className="text-xs text-gray-400 shrink-0">
                {ingredient.unit}{ingredient.is_pantry ? ' · despensa' : ''}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
