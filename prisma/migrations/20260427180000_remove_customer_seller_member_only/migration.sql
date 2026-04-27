-- Member replaces Customer + Seller. Store/Order link only via memberId.

-- CreateTable
CREATE TABLE `Member` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Member_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Preserve Seller ids so Store.sellerId can map to Member.id 1:1
INSERT INTO `Member` (`id`, `name`, `phone`, `createdAt`)
SELECT `id`, `name`, `phone`, `createdAt` FROM `Seller`;

INSERT INTO `Member` (`id`, `name`, `phone`, `createdAt`)
SELECT `c`.`id`, `c`.`name`, `c`.`phone`, CURRENT_TIMESTAMP(3)
FROM `Customer` `c`
WHERE NOT EXISTS (SELECT 1 FROM `Member` `m` WHERE `m`.`phone` = `c`.`phone`);

-- Order: move from customerId -> memberId (match Customer.phone -> Member.phone)
ALTER TABLE `Order` ADD COLUMN `memberId` VARCHAR(191) NULL;

UPDATE `Order` `o`
INNER JOIN `Customer` `c` ON `c`.`id` = `o`.`customerId`
INNER JOIN `Member` `m` ON `m`.`phone` = `c`.`phone`
SET `o`.`memberId` = `m`.`id`;

DELETE FROM `Order` WHERE `memberId` IS NULL;

ALTER TABLE `Order` DROP FOREIGN KEY `Order_customerId_fkey`;

DROP INDEX `Order_customerId_idx` ON `Order`;

ALTER TABLE `Order` DROP COLUMN `customerId`;

ALTER TABLE `Order` MODIFY `memberId` VARCHAR(191) NOT NULL;

CREATE INDEX `Order_memberId_idx` ON `Order`(`memberId`);

ALTER TABLE `Order` ADD CONSTRAINT `Order_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Store: sellerId -> memberId (Member.id == Seller.id for seller rows)
ALTER TABLE `Store` ADD COLUMN `memberId` VARCHAR(191) NULL;

UPDATE `Store` SET `memberId` = `sellerId`;

DELETE FROM `Store` WHERE `memberId` IS NULL;

ALTER TABLE `Store` DROP FOREIGN KEY `Store_sellerId_fkey`;

DROP INDEX `Store_sellerId_slug_key` ON `Store`;

DROP INDEX `Store_sellerId_idx` ON `Store`;

ALTER TABLE `Store` DROP COLUMN `sellerId`;

ALTER TABLE `Store` MODIFY `memberId` VARCHAR(191) NOT NULL;

CREATE UNIQUE INDEX `Store_memberId_slug_key` ON `Store`(`memberId`, `slug`);

CREATE INDEX `Store_memberId_idx` ON `Store`(`memberId`);

ALTER TABLE `Store` ADD CONSTRAINT `Store_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

DROP TABLE `Seller`;

DROP TABLE `Customer`;
