import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import pool from '../config/database';
import {
  MealEvent, MealEventWithIngredients, EventIngredient,
  CreateMealEventInput, EventIngredientInput,
} from '../models/MealEvent';
import { AppError } from '../middleware/errorHandler';

export async function getAll(userId: number): Promise<MealEvent[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT me.*, COUNT(ei.id) AS ingredient_count
     FROM meal_events me
     LEFT JOIN event_ingredients ei ON ei.meal_event_id = me.id
     WHERE me.user_id = ?
     GROUP BY me.id
     ORDER BY me.name`,
    [userId],
  );
  return rows as MealEvent[];
}

export async function getById(id: number): Promise<MealEventWithIngredients | null> {
  const [eventRows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM meal_events WHERE id = ?',
    [id],
  );
  if (!eventRows[0]) return null;
  const event = eventRows[0] as MealEvent;

  const [ingRows] = await pool.query<RowDataPacket[]>(
    `SELECT ei.*, i.name AS ingredient_name, i.unit AS base_unit
     FROM event_ingredients ei
     JOIN ingredients i ON i.id = ei.ingredient_id
     WHERE ei.meal_event_id = ?
     ORDER BY i.name`,
    [id],
  );

  return { ...event, ingredients: ingRows as EventIngredient[] };
}

export async function create(
  userId: number,
  data: CreateMealEventInput,
): Promise<MealEventWithIngredients> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query<ResultSetHeader>(
      'INSERT INTO meal_events (user_id, name, description) VALUES (?, ?, ?)',
      [userId, data.name.trim(), data.description ?? null],
    );
    const eventId = result.insertId;

    if (data.ingredients.length > 0) {
      await insertIngredients(connection, eventId, data.ingredients);
    }

    await connection.commit();
    return (await getById(eventId))!;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

export async function updateMeta(
  id: number,
  data: Partial<Pick<CreateMealEventInput, 'name' | 'description'>>,
): Promise<MealEvent> {
  const existing = await getById(id);
  if (!existing) throw new AppError(404, `Evento ${id} no encontrado.`);

  const setClauses: string[] = [];
  const values: unknown[] = [];

  if (data.name !== undefined) { setClauses.push('name = ?'); values.push(data.name.trim()); }
  if (data.description !== undefined) { setClauses.push('description = ?'); values.push(data.description); }

  if (setClauses.length > 0) {
    values.push(id);
    await pool.query(`UPDATE meal_events SET ${setClauses.join(', ')} WHERE id = ?`, values);
  }

  return (await getById(id))!;
}

export async function replaceIngredients(
  eventId: number,
  ingredients: EventIngredientInput[],
): Promise<MealEventWithIngredients> {
  const existing = await getById(eventId);
  if (!existing) throw new AppError(404, `Evento ${eventId} no encontrado.`);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM event_ingredients WHERE meal_event_id = ?', [eventId]);
    if (ingredients.length > 0) {
      await insertIngredients(connection, eventId, ingredients);
    }
    await connection.commit();
    return (await getById(eventId))!;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

export async function deleteById(id: number): Promise<void> {
  const existing = await getById(id);
  if (!existing) throw new AppError(404, `Evento ${id} no encontrado.`);
  // event_ingredients tiene ON DELETE CASCADE
  await pool.query('DELETE FROM meal_events WHERE id = ?', [id]);
}

async function insertIngredients(
  connection: Awaited<ReturnType<typeof pool.getConnection>>,
  eventId: number,
  ingredients: EventIngredientInput[],
): Promise<void> {
  for (const ing of ingredients) {
    await connection.query(
      'INSERT INTO event_ingredients (meal_event_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)',
      [eventId, ing.ingredient_id, ing.quantity, ing.unit],
    );
  }
}
