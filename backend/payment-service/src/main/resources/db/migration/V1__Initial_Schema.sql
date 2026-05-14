-- DDL for Payment Service
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS allocation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affilie_id UUID NOT NULL,
    liquidation_id UUID,
    montant DECIMAL(19,2) NOT NULL,
    date_debut DATE,
    status VARCHAR(20) DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS paiement (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    allocation_id UUID REFERENCES allocation(id),
    montant DECIMAL(19,2) NOT NULL,
    date_echeance DATE,
    date_paiement_effectif TIMESTAMP,
    status VARCHAR(20) DEFAULT 'SCHEDULED',
    transaction_reference VARCHAR(100)
);

CREATE INDEX idx_allocation_affilie ON allocation(affilie_id);
CREATE INDEX idx_paiement_allocation ON paiement(allocation_id);
CREATE INDEX idx_paiement_status ON paiement(status);
