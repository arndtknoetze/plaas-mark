-- Drop products that do not reference a Store row before adding FK.
DELETE FROM `Product`
WHERE `vendorId` NOT IN (SELECT `id` FROM `Store`);

-- Require real store id (no legacy empty default).
ALTER TABLE `Product` MODIFY `vendorId` VARCHAR(191) NOT NULL;

-- Foreign key: product belongs to exactly one store (area scoping uses Store.locationId).
ALTER TABLE `Product`
ADD CONSTRAINT `Product_vendorId_fkey`
FOREIGN KEY (`vendorId`) REFERENCES `Store` (`id`)
ON DELETE CASCADE ON UPDATE CASCADE;
