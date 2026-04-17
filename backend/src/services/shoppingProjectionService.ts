import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import pool from '../config/database';
import { ShoppingLineItem, SavedShoppingList } from '../models/ShoppingList';
import { convertToBaseUnit, getBaseUnit } from '../utils/unitConverter';

interface RawRow {
  id: number;
  name: string;
  base_unit: string;
  quantity: number;
  raw_unit: string;
}

// Query UNION ALL: un solo round-trip a la DB combina slots con receta y slots con evento.
// Los filtros is_fasting=0 e is_pantry=0 se aplican en SQL para evitar N+1.
// Exportada para permitir tests sin mock de DB.
export const PROJECTION_QUERY = `
  SELECT i.id, i.name, i.unit AS base_unit, ri.quantity, ri.unit AS raw_unit
  FROM meal_slots ms
    JOIN recipes r             ON r.id  = ms.recipe_id
    JOIN recipe_ingredients ri ON ri.recipe_id = r.id
    JOIN ingredients i         ON i.id  = ri.ingredient_id
  WHERE ms.user_id = ? AND ms.slot_date BETWEEN ? AND ?
    AND ms.is_fasting = 0 AND ms.recipe_id IS NOT NULL AND i.is_pantry = 0

  UNION ALL

  SELECT i.id, i.name, i.unit AS base_unit, ei.quantity, ei.unit AS raw_unit
  FROM meal_slots ms
    JOIN meal_events me       ON me.id = ms.meal_event_id
    JOIN event_ingredients ei ON ei.meal_event_id = me.id
    JOIN ingredients i        ON i.id  = ei.ingredient_id
  WHERE ms.user_id = ? AND ms.slot_date BETWEEN ? AND ?
    AND ms.is_fasting = 0 AND ms.meal_event_id IS NOT NULL AND i.is_pantry = 0
`;

export async function calculate(
  userId: number,
  dateFrom: string,
  dateTo: string,
): Promise<ShoppingLineItem[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    PROJECTION_QUERY,
    [userId, dateFrom, dateTo, userId, dateFrom, dateTo],
  );
  return aggregateRows(rows as RawRow[]);
}

export async function save(
  userId: number,
  dateFrom: string,
  dateTo: string,
  items: ShoppingLineItem[],
): Promise<SavedShoppingList> {
  // Contar slots no-ayuno en el rango (metadata de debug)
  const [slotRows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS cnt FROM meal_slots
     WHERE user_id = ? AND slot_date BETWEEN ? AND ? AND is_fasting = 0`,
    [userId, dateFrom, dateTo],
  );
  const totalSlots = (slotRows[0] as RowDataPacket)['cnt'] as number;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO shopping_lists (user_id, date_from, date_to, total_slots, total_items)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, dateFrom, dateTo, totalSlots, items.length],
    );
    const listId = result.insertId;

    for (const item of items) {
      await connection.query(
        `INSERT INTO shopping_list_items (shopping_list_id, ingredient_id, total_quantity, unit)
         VALUES (?, ?, ?, ?)`,
        [listId, item.ingredient_id, item.total_quantity, item.unit],
      );
    }

    await connection.commit();

    const [listRows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM shopping_lists WHERE id = ?',
      [listId],
    );
    return listRows[0] as SavedShoppingList;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

export async function getSavedLists(userId: number): Promise<SavedShoppingList[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM shopping_lists WHERE user_id = ? ORDER BY generated_at DESC LIMIT 20',
    [userId],
  );
  return rows as SavedShoppingList[];
}

// Función pura: normaliza unidades y acumula por ingrediente. Exportada para tests.
export function aggregateRows(rows: RawRow[]): ShoppingLineItem[] {
  const map = new Map<number, { name: string; total: number; unit: string }>();

  for (const row of rows) {
    const baseUnit = getBaseUnit(row.base_unit);
    const baseQty  = convertToBaseUnit(row.quantity, row.raw_unit);
    const existing = map.get(row.id);

    if (existing) {
      existing.total += baseQty;
    } else {
      map.set(row.id, { name: row.name, total: baseQty, unit: baseUnit });
    }
  }

  return Array.from(map.entries())
    .map(([ingredient_id, { name, total, unit }]) => ({
      ingredient_id,
      ingredient_name: name,
      total_quantity: Math.round(total * 1000) / 1000, // evitar drift de floating point
      unit,
    }))
    .sort((a, b) => a.ingredient_name.localeCompare(b.ingredient_name));
}
