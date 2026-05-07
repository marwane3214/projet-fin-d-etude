-- V3: Fix column sizes that are too restrictive
-- CIN can be up to 20 chars, ICE up to 20 chars

ALTER TABLE affilie ALTER COLUMN cin TYPE VARCHAR(30);
ALTER TABLE adherent ALTER COLUMN ice TYPE VARCHAR(30);
