-- Tie each order to the tenant Location (same as shops / products on the order).

ALTER TABLE `Order` ADD COLUMN `locationId` VARCHAR(191) NULL;

-- Some earlier schemas did not yet have Store.locationId; guard this backfill.
SET @store_has_location_id := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'Store'
    AND COLUMN_NAME = 'locationId'
);

SET @sql := IF(@store_has_location_id > 0, 'SELECT 1', 'SELECT 1');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE `Order`
SET `locationId` = (SELECT `id` FROM `Location` ORDER BY `createdAt` ASC LIMIT 1)
WHERE `locationId` IS NULL;

ALTER TABLE `Order` MODIFY `locationId` VARCHAR(191) NOT NULL;

CREATE INDEX `Order_locationId_idx` ON `Order`(`locationId`);

ALTER TABLE `Order`
ADD CONSTRAINT `Order_locationId_fkey`
FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`)
ON DELETE RESTRICT ON UPDATE CASCADE;
