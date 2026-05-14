-- DDL for Liquidation Service
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS demande_liquidation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affilie_id VARCHAR(255) NOT NULL,
    date_demande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_effet_souhaitee DATE,
    status VARCHAR(50) DEFAULT 'SUBMITTED',
    commentaire_admin TEXT
);

CREATE TABLE IF NOT EXISTS dossier_document (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    demande_id UUID REFERENCES demande_liquidation(id),
    type_document VARCHAR(100),
    file_uri TEXT,
    is_verified BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_liquidation_affilie ON demande_liquidation(affilie_id);
CREATE INDEX idx_document_demande ON dossier_document(demande_id);
