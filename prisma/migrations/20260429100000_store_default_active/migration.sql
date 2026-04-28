-- Default new shops to visible in the catalogue; sellers can deactivate later.
ALTER TABLE `Store` MODIFY COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;
