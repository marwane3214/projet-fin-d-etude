-- DDL for Contribution Service
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS cotisation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affilie_id UUID NOT NULL,
    adherent_id UUID NOT NULL,
    montant DECIMAL(19,2) NOT NULL,
    periode_debut DATE,
    periode_fin DATE,
    date_paiement DATE,
    points_generes DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS points_cumules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affilie_id UUID UNIQUE NOT NULL,
    total_points DOUBLE PRECISION DEFAULT 0.0,
    derniere_mise_a_jour TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cotisation_affilie ON cotisation(affilie_id);
CREATE INDEX idx_points_affilie ON points_cumules(affilie_id);
