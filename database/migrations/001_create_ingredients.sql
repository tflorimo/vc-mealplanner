-- Migración 001: Tabla maestra de ingredientes
-- Esta es la tabla fundacional. Todas las demás tablas FK a esta.
-- El UNIQUE en 'name' es lo que enforces la normalización de datos.

CREATE TABLE IF NOT EXISTS ingredients (
    id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    name        VARCHAR(120)    NOT NULL,
    unit        VARCHAR(30)     NOT NULL,           -- unidad base: 'kg', 'g', 'L', 'ml', 'u' (pieza)
    is_pantry   TINYINT(1)      NOT NULL DEFAULT 0, -- 1 = despensa, nunca aparece en lista de compras
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_ingredient_name (name),           -- enforces normalización, evita "papa" y "papas"
    INDEX idx_ingredient_name_prefix (name),        -- búsqueda por prefijo para autocompletado
    INDEX idx_is_pantry (is_pantry)                 -- filtro en motor de compras
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
