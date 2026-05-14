-- Add point_values table for yearly point values
CREATE TABLE IF NOT EXISTS point_values (
    id BIGSERIAL PRIMARY KEY,
    year INTEGER NOT NULL UNIQUE,
    value DECIMAL(19,2) NOT NULL
);

-- Add taux column to contributions
ALTER TABLE contributions ADD COLUMN IF NOT EXISTS taux DECIMAL(19,2);

CREATE INDEX IF NOT EXISTS idx_point_values_year ON point_values(year);