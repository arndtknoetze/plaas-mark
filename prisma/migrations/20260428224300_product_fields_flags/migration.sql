-- Bring Product table in sync with current Prisma schema.
-- Safe on fresh DB created from prior migrations.

ALTER TABLE `Product`
  ADD COLUMN `description` LONGTEXT NULL,
  ADD COLUMN `tags` JSON NULL,
  ADD COLUMN `images` JSON NULL,
  ADD COLUMN `isFeatured` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;

