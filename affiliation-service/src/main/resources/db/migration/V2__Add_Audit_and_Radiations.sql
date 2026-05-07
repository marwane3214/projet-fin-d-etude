-- Affilie status and date_suspension
ALTER TABLE affilie ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ACTIVE';
ALTER TABLE affilie ADD COLUMN IF NOT EXISTS date_suspension TIMESTAMP;

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    entite_id VARCHAR(255) NOT NULL,
    entite_type VARCHAR(255) NOT NULL,
    details TEXT,
    performed_by VARCHAR(255),
    timestamp TIMESTAMP NOT NULL
);

-- Radiations table
CREATE TABLE IF NOT EXISTS radiations (
    id UUID PRIMARY KEY,
    affilie_id UUID NOT NULL,
    motif TEXT NOT NULL,
    date_radiation TIMESTAMP NOT NULL,
    contribution_compensatrice DECIMAL(19, 2),
    CONSTRAINT fk_radiation_affilie FOREIGN KEY (affilie_id) REFERENCES affilie(id)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_audit_entite ON audit_logs(entite_id);
CREATE INDEX IF NOT EXISTS idx_radiation_affilie ON radiations(affilie_id);
