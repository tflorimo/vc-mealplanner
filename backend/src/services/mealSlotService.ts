import { RowDataPacket } from 'mysql2/promise';
import pool from '../config/database';
import { MealSlotWithDetails, UpsertSlotInput } from '../models/MealSlot';
import { AppError } from '../middleware/errorHandler';
import { SlotType } from '../config/constants';
import { getMonthRange } from '../utils/dateHelpers';

function normalizeSlot(row: RowDataPacket): MealSlotWithDetails {
  return {
    ...row,
    is_fasting:     row['is_fasting'] === 1,
    recipe_name:    row['recipe_name'] ?? null,
    event_name:     row['event_name'] ?? null,
  } as MealSlotWithDetails;
}

// Devuelve todos los slots con datos para un mes (no crea filas vacías).
export async function getByMonth(
  userId: number,
  year: number,
  month: number,
): Promise<MealSlotWithDetails[]> {
  const { dateFrom, dateTo } = getMonthRange(year, month);

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT ms.*,
            r.name  AS recipe_name,
            me.name AS event_name
     FROM meal_slots ms
     LEFT JOIN recipes     r  ON r.id  = ms.recipe_id
     LEFT JOIN meal_events me ON me.id = ms.meal_event_id
     WHERE ms.user_id = ?
       AND ms.slot_date BETWEEN ? AND ?
     ORDER BY ms.slot_date,
              FIELD(ms.slot_type, 'desayuno', 'almuerzo', 'merienda', 'cena')`,
    [userId, dateFrom, dateTo],
  );

  return rows.map(normalizeSlot);
}

// Upsert: crea o actualiza un slot. Enforza exclusión mutua (sin CHECK en MySQL).
export async function upsert(
  userId: number,
  slotDate: string,
  slotType: SlotType,
  data: UpsertSlotInput,
): Promise<MealSlotWithDetails> {
  const isFasting = data.is_fasting ?? false;
  const recipeId   = data.recipe_id   ?? null;
  const eventId    = data.meal_event_id ?? null;

  // Validaciones de exclusión mutua (reemplaza el CHECK constraint removido)
  if (recipeId !== null && eventId !== null) {
    throw new AppError(400, 'Un slot no puede tener receta y evento al mismo tiempo.');
  }
  if (isFasting && (recipeId !== null || eventId !== null)) {
    throw new AppError(400, 'Un slot en ayuno no puede tener receta o evento asignado.');
  }

  await pool.query(
    `INSERT INTO meal_slots
       (user_id, slot_date, slot_type, is_fasting, recipe_id, meal_event_id)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       is_fasting    = VALUES(is_fasting),
       recipe_id     = VALUES(recipe_id),
       meal_event_id = VALUES(meal_event_id),
       updated_at    = CURRENT_TIMESTAMP`,
    [userId, slotDate, slotType, isFasting ? 1 : 0, recipeId, eventId],
  );

  const slot = await getSlot(userId, slotDate, slotType);
  if (!slot) throw new AppError(500, 'Error al recuperar el slot después del upsert.');
  return slot;
}

// Limpia un slot (lo deja vacío borrando la fila).
export async function clear(
  userId: number,
  slotDate: string,
  slotType: SlotType,
): Promise<void> {
  await pool.query(
    'DELETE FROM meal_slots WHERE user_id = ? AND slot_date = ? AND slot_type = ?',
    [userId, slotDate, slotType],
  );
}

async function getSlot(
  userId: number,
  slotDate: string,
  slotType: string,
): Promise<MealSlotWithDetails | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT ms.*,
            r.name  AS recipe_name,
            me.name AS event_name
     FROM meal_slots ms
     LEFT JOIN recipes     r  ON r.id  = ms.recipe_id
     LEFT JOIN meal_events me ON me.id = ms.meal_event_id
     WHERE ms.user_id = ? AND ms.slot_date = ? AND ms.slot_type = ?`,
    [userId, slotDate, slotType],
  );
  return rows[0] ? normalizeSlot(rows[0]) : null;
}
