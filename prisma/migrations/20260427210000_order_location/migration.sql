-- Tie each order to the tenant Location (same as shops / products on the order).

ALTER TABLE `Order` ADD COLUMN `locationId` VARCHAR(191) NULL;

UPDATE `Order` o
SET o.`locationId` = (
  SELECT s.`locationId`
  FROM `OrderItem` oi
  INNER JOIN `Product` p ON p.`id` = oi.`productId`
  INNER JOIN `Store` s ON s.`id` = p.`vendorId`
  WHERE oi.`orderId` = o.`id`
  LIMIT 1
);

UPDATE `Order`
SET `locationId` = (SELECT `id` FROM `Location` ORDER BY `createdAt` ASC LIMIT 1)
WHERE `locationId` IS NULL;

ALTER TABLE `Order` MODIFY `locationId` VARCHAR(191) NOT NULL;

CREATE INDEX `Order_locationId_idx` ON `Order`(`locationId`);

ALTER TABLE `Order`
ADD CONSTRAINT `Order_locationId_fkey`
FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`)
ON DELETE RESTRICT ON UPDATE CASCADE;
