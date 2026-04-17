import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import pool from '../config/database';
import { Recipe, RecipeWithIngredients, RecipeIngredient, CreateRecipeInput, RecipeIngredientInput } from '../models/Recipe';
import { AppError } from '../middleware/errorHandler';
import { DEFAULT_DINERS } from '../config/constants';

export async function getAll(userId: number): Promise<Recipe[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT r.*, COUNT(ri.id) AS ingredient_count
     FROM recipes r
     LEFT JOIN recipe_ingredients ri ON ri.recipe_id = r.id
     WHERE r.user_id = ?
     GROUP BY r.id
     ORDER BY r.name`,
    [userId],
  );
  return rows as Recipe[];
}

export async function getById(id: number): Promise<RecipeWithIngredients | null> {
  const [recipeRows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM recipes WHERE id = ?',
    [id],
  );
  if (!recipeRows[0]) return null;
  const recipe = recipeRows[0] as Recipe;

  const [ingRows] = await pool.query<RowDataPacket[]>(
    `SELECT ri.*, i.name AS ingredient_name, i.unit AS base_unit
     FROM recipe_ingredients ri
     JOIN ingredients i ON i.id = ri.ingredient_id
     WHERE ri.recipe_id = ?
     ORDER BY i.name`,
    [id],
  );

  return { ...recipe, ingredients: ingRows as RecipeIngredient[] };
}

export async function create(
  userId: number,
  data: CreateRecipeInput,
): Promise<RecipeWithIngredients> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query<ResultSetHeader>(
      'INSERT INTO recipes (user_id, name, description, diners) VALUES (?, ?, ?, ?)',
      [userId, data.name.trim(), data.description ?? null, data.diners ?? DEFAULT_DINERS],
    );
    const recipeId = result.insertId;

    if (data.ingredients.length > 0) {
      await insertIngredients(connection, recipeId, data.ingredients);
    }

    await connection.commit();
    return (await getById(recipeId))!;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

export async function updateMeta(
  id: number,
  data: Partial<Pick<CreateRecipeInput, 'name' | 'description' | 'diners'>>,
): Promise<Recipe> {
  const existing = await getById(id);
  if (!existing) throw new AppError(404, `Receta ${id} no encontrada.`);

  const setClauses: string[] = [];
  const values: unknown[] = [];

  if (data.name !== undefined) { setClauses.push('name = ?'); values.push(data.name.trim()); }
  if (data.description !== undefined) { setClauses.push('description = ?'); values.push(data.description); }
  if (data.diners !== undefined) { setClauses.push('diners = ?'); values.push(data.diners); }

  if (setClauses.length > 0) {
    values.push(id);
    await pool.query(`UPDATE recipes SET ${setClauses.join(', ')} WHERE id = ?`, values);
  }

  const updated = await getById(id);
  return updated!;
}

// Reemplaza los ingredientes de una receta de forma atómica.
export async function replaceIngredients(
  recipeId: number,
  ingredients: RecipeIngredientInput[],
): Promise<RecipeWithIngredients> {
  const existing = await getById(recipeId);
  if (!existing) throw new AppError(404, `Receta ${recipeId} no encontrada.`);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM recipe_ingredients WHERE recipe_id = ?', [recipeId]);
    if (ingredients.length > 0) {
      await insertIngredients(connection, recipeId, ingredients);
    }
    await connection.commit();
    return (await getById(recipeId))!;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

export async function deleteById(id: number): Promise<void> {
  const existing = await getById(id);
  if (!existing) throw new AppError(404, `Receta ${id} no encontrada.`);
  // recipe_ingredients tiene ON DELETE CASCADE, se borran en cascada
  await pool.query('DELETE FROM recipes WHERE id = ?', [id]);
}

// Helper interno: inserta los ingredientes de una receta dentro de una conexión/transacción.
async function insertIngredients(
  connection: Awaited<ReturnType<typeof pool.getConnection>>,
  recipeId: number,
  ingredients: RecipeIngredientInput[],
): Promise<void> {
  for (const ing of ingredients) {
    await connection.query(
      'INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)',
      [recipeId, ing.ingredient_id, ing.quantity, ing.unit],
    );
  }
}
