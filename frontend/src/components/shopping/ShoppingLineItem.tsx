import { ShoppingLineItem as LineItem } from '../../models/ShoppingList';

interface Props {
  item: LineItem;
}

export function ShoppingLineItem({ item }: Props) {
  const qty = Number.isInteger(item.total_quantity)
    ? item.total_quantity.toString()
    : item.total_quantity.toFixed(3).replace(/\.?0+$/, '');

  return (
    <li className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-gray-800 font-medium">{item.ingredient_name}</span>
      <span className="text-gray-600 tabular-nums">
        {qty} <span className="text-gray-400">{item.unit}</span>
      </span>
    </li>
  );
}
