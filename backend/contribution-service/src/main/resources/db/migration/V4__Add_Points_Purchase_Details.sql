-- V4: Add details for points purchase verification flow

ALTER TABLE points_purchase ADD COLUMN affilie_nom VARCHAR(255);
ALTER TABLE points_purchase ADD COLUMN reference_virement VARCHAR(100);
ALTER TABLE points_purchase ADD COLUMN banque VARCHAR(100);
ALTER TABLE points_purchase ADD COLUMN date_virement TIMESTAMP;
ALTER TABLE points_purchase ADD COLUMN preuve_path VARCHAR(500);
ALTER TABLE points_purchase ADD COLUMN statut VARCHAR(20) DEFAULT 'EN_ATTENTE';
ALTER TABLE points_purchase ADD COLUMN motif_rejet TEXT;
ALTER TABLE points_purchase ADD COLUMN valide_par VARCHAR(100);
ALTER TABLE points_purchase ADD COLUMN date_validation TIMESTAMP;

-- If type doesn't exist, it was added in V1, but checking just in case
-- ALTER TABLE points_purchase ADD COLUMN type VARCHAR(50); 
