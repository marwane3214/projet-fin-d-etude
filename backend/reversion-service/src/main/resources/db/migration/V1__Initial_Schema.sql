-- DDL for Réversion Service
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS ayant_droit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affilie_decede_id UUID NOT NULL,
    cin VARCHAR(20),
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    relation VARCHAR(50) NOT NULL,
    date_naissance DATE,
    is_eligible BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_reversion_affilie ON ayant_droit(affilie_decede_id);
CREATE INDEX idx_reversion_cin ON ayant_droit(cin);
