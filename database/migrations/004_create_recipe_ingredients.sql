-- Migración 004: Ingredientes de receta (tabla de unión recipe ↔ ingredient)
-- 'unit' puede diferir de ingredients.unit (ej: la receta pide 500g, el maestro usa kg).
-- El motor de compras normaliza la unidad al agregar.
-- ON DELETE RESTRICT en ingredient_id: no se puede borrar un ingrediente del maestro
-- si está siendo usado en alguna receta.

CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    recipe_id       INT UNSIGNED    NOT NULL,
    ingredient_id   INT UNSIGNED    NOT NULL,
    quantity        DECIMAL(10, 3)  NOT NULL,       -- DECIMAL para aritmética exacta (sin errores float)
    unit            VARCHAR(30)     NOT NULL,        -- unidad tal como fue ingresada en la receta

    PRIMARY KEY (id),
    UNIQUE KEY uq_recipe_ingredient (recipe_id, ingredient_id), -- un ingrediente por receta
    INDEX idx_ri_recipe (recipe_id),
    INDEX idx_ri_ingredient (ingredient_id),
    CONSTRAINT fk_ri_recipe      FOREIGN KEY (recipe_id)     REFERENCES recipes(id)     ON DELETE CASCADE,
    CONSTRAINT fk_ri_ingredient  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
