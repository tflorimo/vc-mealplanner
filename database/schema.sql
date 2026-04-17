-- ============================================================
-- VC Meal Planner - Schema Canónico
-- Las migraciones en migrations/ derivan de este archivo.
-- Para crear la DB desde cero: ejecutar runMigrations.ts
-- ============================================================

-- ingredients: Maestro central. TODO le hace FK a esta tabla.
CREATE TABLE IF NOT EXISTS ingredients (
    id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    name        VARCHAR(120)    NOT NULL,
    unit        VARCHAR(30)     NOT NULL,
    is_pantry   TINYINT(1)      NOT NULL DEFAULT 0,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_ingredient_name (name),
    INDEX idx_ingredient_name_prefix (name),
    INDEX idx_is_pantry (is_pantry)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- users: MVP con user_id = 1 siempre.
CREATE TABLE IF NOT EXISTS users (
    id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    display_name  VARCHAR(100)  NOT NULL,
    diners        TINYINT       NOT NULL DEFAULT 2,
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO users (id, display_name, diners) VALUES (1, 'Default User', 2);

-- recipes: Catálogo de recetas reutilizables.
CREATE TABLE IF NOT EXISTS recipes (
    id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    user_id     INT UNSIGNED    NOT NULL,
    name        VARCHAR(200)    NOT NULL,
    description TEXT            NULL,
    diners      TINYINT         NOT NULL DEFAULT 2,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_recipe_user (user_id),
    INDEX idx_recipe_name (name),
    CONSTRAINT fk_recipe_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- recipe_ingredients: Ingredientes de cada receta.
-- DECIMAL(10,3) para evitar errores de punto flotante en sumas.
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    recipe_id       INT UNSIGNED    NOT NULL,
    ingredient_id   INT UNSIGNED    NOT NULL,
    quantity        DECIMAL(10, 3)  NOT NULL,
    unit            VARCHAR(30)     NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_recipe_ingredient (recipe_id, ingredient_id),
    INDEX idx_ri_recipe (recipe_id),
    INDEX idx_ri_ingredient (ingredient_id),
    CONSTRAINT fk_ri_recipe      FOREIGN KEY (recipe_id)     REFERENCES recipes(id)     ON DELETE CASCADE,
    CONSTRAINT fk_ri_ingredient  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- meal_events: Comidas one-off no guardadas como recetas.
CREATE TABLE IF NOT EXISTS meal_events (
    id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    user_id     INT UNSIGNED    NOT NULL,
    name        VARCHAR(200)    NOT NULL,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_event_user (user_id),
    CONSTRAINT fk_event_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- event_ingredients: Ingredientes de eventos aislados.
-- ingredient_id DEBE existir en el maestro (enforced por FK).
CREATE TABLE IF NOT EXISTS event_ingredients (
    id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    meal_event_id   INT UNSIGNED    NOT NULL,
    ingredient_id   INT UNSIGNED    NOT NULL,
    quantity        DECIMAL(10, 3)  NOT NULL,
    unit            VARCHAR(30)     NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_event_ingredient (meal_event_id, ingredient_id),
    INDEX idx_ei_event (meal_event_id),
    INDEX idx_ei_ingredient (ingredient_id),
    CONSTRAINT fk_ei_event       FOREIGN KEY (meal_event_id)  REFERENCES meal_events(id)  ON DELETE CASCADE,
    CONSTRAINT fk_ei_ingredient  FOREIGN KEY (ingredient_id)  REFERENCES ingredients(id)  ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- meal_slots: Las celdas del calendario (1 fila = 1 día + 1 tipo de slot).
-- idx_slot_date_range es el índice más importante: es el hot path del motor de compras.
CREATE TABLE IF NOT EXISTS meal_slots (
    id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    user_id         INT UNSIGNED    NOT NULL,
    slot_date       DATE            NOT NULL,
    slot_type       ENUM('desayuno','almuerzo','merienda','cena') NOT NULL,
    is_fasting      TINYINT(1)      NOT NULL DEFAULT 0,
    recipe_id       INT UNSIGNED    NULL,
    meal_event_id   INT UNSIGNED    NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_slot (user_id, slot_date, slot_type),
    INDEX idx_slot_date_range (user_id, slot_date),
    INDEX idx_slot_recipe (recipe_id),
    INDEX idx_slot_event (meal_event_id),
    CONSTRAINT chk_slot_assignment CHECK (
        (recipe_id IS NULL OR meal_event_id IS NULL)
        AND NOT (is_fasting = 1 AND (recipe_id IS NOT NULL OR meal_event_id IS NOT NULL))
    ),
    CONSTRAINT fk_slot_user   FOREIGN KEY (user_id)       REFERENCES users(id)       ON DELETE CASCADE,
    CONSTRAINT fk_slot_recipe FOREIGN KEY (recipe_id)     REFERENCES recipes(id)     ON DELETE SET NULL,
    CONSTRAINT fk_slot_event  FOREIGN KEY (meal_event_id) REFERENCES meal_events(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- shopping_lists: Snapshots persistidos para soporte offline (PWA).
CREATE TABLE IF NOT EXISTS shopping_lists (
    id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    user_id         INT UNSIGNED    NOT NULL,
    date_from       DATE            NOT NULL,
    date_to         DATE            NOT NULL,
    generated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_slots     SMALLINT        NOT NULL,
    total_items     SMALLINT        NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_sl_user_date (user_id, generated_at),
    CONSTRAINT fk_sl_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS shopping_list_items (
    id                  INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    shopping_list_id    INT UNSIGNED    NOT NULL,
    ingredient_id       INT UNSIGNED    NOT NULL,
    total_quantity      DECIMAL(10, 3)  NOT NULL,
    unit                VARCHAR(30)     NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_sli_list (shopping_list_id),
    INDEX idx_sli_ingredient (ingredient_id),
    CONSTRAINT fk_sli_list       FOREIGN KEY (shopping_list_id) REFERENCES shopping_lists(id) ON DELETE CASCADE,
    CONSTRAINT fk_sli_ingredient FOREIGN KEY (ingredient_id)    REFERENCES ingredients(id)    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
