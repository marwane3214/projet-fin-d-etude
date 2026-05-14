-- DDL for Affiliation Service
-- CIMR Article 6: Affiliation of individuals (Affiliés)
-- CIMR Article 8: Registration of employers (Adhérents)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS adherent (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    raison_sociale VARCHAR(255) NOT NULL,
    ice VARCHAR(15) UNIQUE NOT NULL, -- Identifiant Commun de l'Entreprise
    identifiant_fiscal VARCHAR(20) UNIQUE,
    email VARCHAR(100) UNIQUE,
    telephone VARCHAR(20),
    adresse TEXT,
    date_adhesion DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'ACTIVE' -- ACTIVE, SUSPENDED, TERMINATED
);

CREATE TABLE IF NOT EXISTS affilie (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cin VARCHAR(15) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    date_naissance DATE NOT NULL,
    lieu_naissance VARCHAR(100),
    sexe VARCHAR(10) NOT NULL, -- M, F
    situation_familiale VARCHAR(20), -- CELIBATAIRE, MARIE, etc.
    email VARCHAR(100) UNIQUE,
    telephone VARCHAR(20),
    adresse TEXT,
    ville VARCHAR(50),
    num_immatriculation VARCHAR(30) UNIQUE NOT NULL, -- CIMR Registration Number
    date_inscription DATE DEFAULT CURRENT_DATE,
    date_affiliation DATE,
    employeur VARCHAR(255),
    salaire_mensuel NUMERIC(15, 2),
    consent_cndp BOOLEAN DEFAULT FALSE,
    date_consent TIMESTAMP,
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, RETIRED, DECEASED, SUSPENDED, RADIE
    adherent_id UUID REFERENCES adherent(id)
);

CREATE TABLE IF NOT EXISTS bulletin_affiliation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference VARCHAR(50) UNIQUE NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, SUBMITTED, VALIDATED, REJECTED
    affilie_id UUID REFERENCES affilie(id)
);

CREATE TABLE IF NOT EXISTS justificatif (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(255) NOT NULL,
    type_document VARCHAR(50), -- CIN, ACTE_NAISSANCE, RIB, etc.
    url_stockage TEXT,
    date_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    affilie_id UUID REFERENCES affilie(id)
);

-- Index for performance
CREATE INDEX idx_affilie_cin ON affilie(cin);
CREATE INDEX idx_affilie_immatriculation ON affilie(num_immatriculation);
CREATE INDEX idx_adherent_ice ON adherent(ice);

-- Sample Data
INSERT INTO adherent (raison_sociale, ice, email) 
VALUES ('CIMR ENTERPRISE TEST', '123456789012345', 'contact@testcorp.ma')
ON CONFLICT DO NOTHING;

INSERT INTO affilie (cin, nom, prenom, date_naissance, sexe, num_immatriculation, adherent_id, consent_cndp)
SELECT 'AB123456', 'ALAMI', 'Mohamed', '1980-01-01', 'M', 'CIMR-2024-0001', id, TRUE 
FROM adherent WHERE ice = '123456789012345'
ON CONFLICT DO NOTHING;
