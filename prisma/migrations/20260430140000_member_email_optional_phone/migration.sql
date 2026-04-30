-- Email as optional unique identifier; phone becomes optional (multiple NULLs allowed for unique).
ALTER TABLE `Member` ADD COLUMN `email` VARCHAR(191) NULL;
CREATE UNIQUE INDEX `Member_email_key` ON `Member`(`email`);
ALTER TABLE `Member` MODIFY `phone` VARCHAR(191) NULL;
DROP INDEX `Member_phone_key` ON `Member`;
CREATE UNIQUE INDEX `Member_phone_key` ON `Member`(`phone`);
