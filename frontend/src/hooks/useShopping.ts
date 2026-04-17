import { useState } from 'react';
import { shoppingApi } from '../services/shoppingApi';
import { ShoppingLineItem, SavedShoppingList } from '../models/ShoppingList';

interface ShoppingState {
  items: ShoppingLineItem[];
  savedList: SavedShoppingList | null;
  loading: boolean;
  error: string | null;
  lastRange: { from: string; to: string } | null;
}

export function useShopping() {
  const [state, setState] = useState<ShoppingState>({
    items: [],
    savedList: null,
    loading: false,
    error: null,
    lastRange: null,
  });

  const [savedLists, setSavedLists] = useState<SavedShoppingList[]>([]);
  const [listsLoading, setListsLoading] = useState(false);

  const calculate = async (dateFrom: string, dateTo: string, save = false) => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const result = await shoppingApi.calculate(dateFrom, dateTo, save);
      setState({
        items: result.items,
        savedList: result.list ?? null,
        loading: false,
        error: null,
        lastRange: { from: dateFrom, to: dateTo },
      });
    } catch {
      setState(s => ({ ...s, loading: false, error: 'Error al calcular la lista de compras' }));
    }
  };

  const fetchSavedLists = async () => {
    setListsLoading(true);
    try {
      const lists = await shoppingApi.getLists();
      setSavedLists(lists);
    } catch {
      // silently ignore — saved lists are non-critical
    } finally {
      setListsLoading(false);
    }
  };

  return { ...state, savedLists, listsLoading, calculate, fetchSavedLists };
}
