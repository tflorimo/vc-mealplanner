import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import pool from '../config/database';
import { Ingredient, CreateIngredientInput, UpdateIngredientInput } from '../models/Ingredient';
import { AppError } from '../middleware/errorHandler';
import { AUTOCOMPLETE_LIMIT } from '../config/constants';

// MySQL2 devuelve TINYINT(1) como número. Normalizamos a boolean.
function normalize(row: RowDataPacket): Ingredient {
  return { ...row, is_pantry: row['is_pantry'] === 1 } as Ingredient;
}

export async function searchByPrefix(
  q: string,
  limit: number = AUTOCOMPLETE_LIMIT,
): Promise<Ingredient[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM ingredients WHERE name LIKE ? ORDER BY name LIMIT ?',
    [`${q}%`, limit],
  );
  return rows.map(normalize);
}

export async function getAll(): Promise<Ingredient[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM ingredients ORDER BY name',
  );
  return rows.map(normalize);
}

export async function getById(id: number): Promise<Ingredient | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM ingredients WHERE id = ?',
    [id],
  );
  return rows[0] ? normalize(rows[0]) : null;
}

export async function create(data: CreateIngredientInput): Promise<Ingredient> {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO ingredients (name, unit, is_pantry) VALUES (?, ?, ?)',
      [data.name.trim(), data.unit, data.is_pantry ? 1 : 0],
    );
    return (await getById(result.insertId))!;
  } catch (err) {
    if (isDuplicateKey(err)) {
      throw new AppError(409, `Ya existe un ingrediente con el nombre '${data.name}'.`);
    }
    throw err;
  }
}

export async function update(id: number, data: UpdateIngredientInput): Promise<Ingredient> {
  const existing = await getById(id);
  if (!existing) throw new AppError(404, `Ingrediente ${id} no encontrado.`);

  const setClauses: string[] = [];
  const values: unknown[] = [];

  if (data.name !== undefined) { setClauses.push('name = ?'); values.push(data.name.trim()); }
  if (data.unit !== undefined) { setClauses.push('unit = ?'); values.push(data.unit); }
  if (data.is_pantry !== undefined) { setClauses.push('is_pantry = ?'); values.push(data.is_pantry ? 1 : 0); }

  if (setClauses.length === 0) return existing;

  values.push(id);
  try {
    await pool.query(`UPDATE ingredients SET ${setClauses.join(', ')} WHERE id = ?`, values);
  } catch (err) {
    if (isDuplicateKey(err)) {
      throw new AppError(409, `Ya existe un ingrediente con el nombre '${data.name}'.`);
    }
    throw err;
  }
  return (await getById(id))!;
}

export async function deleteById(id: number): Promise<void> {
  const existing = await getById(id);
  if (!existing) throw new AppError(404, `Ingrediente ${id} no encontrado.`);

  try {
    await pool.query('DELETE FROM ingredients WHERE id = ?', [id]);
  } catch (err) {
    if (isForeignKeyError(err)) {
      throw new AppError(
        409,
        `No se puede eliminar '${existing.name}' porque está en uso en recetas o eventos.`,
      );
    }
    throw err;
  }
}

function isDuplicateKey(err: unknown): boolean {
  return (err as NodeJS.ErrnoException | null)?.code === 'ER_DUP_ENTRY';
}

function isForeignKeyError(err: unknown): boolean {
  return (err as NodeJS.ErrnoException | null)?.code === 'ER_ROW_IS_REFERENCED_2';
}
