-- Migración 006: Ingredientes de evento aislado (tabla de unión meal_event ↔ ingredient)
-- Espeja exactamente recipe_ingredients. No se permite texto libre:
-- ingredient_id DEBE existir en la tabla maestra (enforced por FK).
-- Esta FK es lo que hace imposible guardar un ingrediente sin pasar por el maestro.

CREATE TABLE IF NOT EXISTS event_ingredients (
    id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    meal_event_id   INT UNSIGNED    NOT NULL,
    ingredient_id   INT UNSIGNED    NOT NULL,       -- DEBE existir en ingredients (enforced por FK)
    quantity        DECIMAL(10, 3)  NOT NULL,
    unit            VARCHAR(30)     NOT NULL,

    PRIMARY KEY (id),
    UNIQUE KEY uq_event_ingredient (meal_event_id, ingredient_id),
    INDEX idx_ei_event (meal_event_id),
    INDEX idx_ei_ingredient (ingredient_id),
    CONSTRAINT fk_ei_event       FOREIGN KEY (meal_event_id)  REFERENCES meal_events(id)  ON DELETE CASCADE,
    CONSTRAINT fk_ei_ingredient  FOREIGN KEY (ingredient_id)  REFERENCES ingredients(id)  ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
