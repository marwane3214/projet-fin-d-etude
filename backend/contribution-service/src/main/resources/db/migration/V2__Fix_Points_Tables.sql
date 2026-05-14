-- Migration to fix table names and add missing points tables
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cotisation') THEN
        ALTER TABLE cotisation RENAME TO contributions;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS points_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affilie_id UUID NOT NULL,
    periode VARCHAR(7) NOT NULL,
    points_acquis DOUBLE PRECISION,
    date_attribution TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS points_purchase (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affilie_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    montant_verse DECIMAL(19,2),
    points_granted DOUBLE PRECISION,
    date_achat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contributions_affilie ON contributions(affilie_id);
CREATE INDEX IF NOT EXISTS idx_points_ledger_affilie ON points_ledger(affilie_id);
CREATE INDEX IF NOT EXISTS idx_points_purchase_affilie ON points_purchase(affilie_id);
