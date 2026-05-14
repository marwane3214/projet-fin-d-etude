CREATE TABLE IF NOT EXISTS support_tickets (
    id BIGSERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    sujet VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    statut VARCHAR(20) NOT NULL DEFAULT 'OUVERT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

CREATE INDEX idx_support_tickets_statut ON support_tickets(statut);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at DESC);
