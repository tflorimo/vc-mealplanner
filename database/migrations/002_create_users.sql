-- Migración 002: Tabla de usuarios
-- MVP: siempre se usa user_id = 1. La columna existe en todas las tablas
-- para que agregar autenticación multi-usuario sea solo una migración de middleware,
-- no de schema.

CREATE TABLE IF NOT EXISTS users (
    id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    display_name  VARCHAR(100)  NOT NULL,
    diners        TINYINT       NOT NULL DEFAULT 2, -- default: 2 comensales por comida
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar usuario por defecto para MVP
INSERT IGNORE INTO users (id, display_name, diners) VALUES (1, 'Default User', 2);
