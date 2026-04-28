-- CreateTable
CREATE TABLE IF NOT EXISTS `Location` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Location_slug_key` (`slug`),
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Ensure at least one Location exists (for later backfills).
INSERT INTO `Location` (`id`, `name`, `slug`, `createdAt`)
SELECT 'loc_malmesbury', 'Malmesbury', 'malmesbury', CURRENT_TIMESTAMP(3)
WHERE NOT EXISTS (SELECT 1 FROM `Location` LIMIT 1);

-- CreateTable
CREATE TABLE `Store` (
    `id` VARCHAR(191) NOT NULL,
    `sellerId` VARCHAR(191) NOT NULL,
    `locationId` VARCHAR(191) NOT NULL DEFAULT 'loc_malmesbury',
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT false,
    `brandColor` VARCHAR(191) NOT NULL DEFAULT '#2E5E3E',
    `logoUrl` TEXT NULL,
    `addressText` TEXT NULL,
    `email` VARCHAR(191) NULL,
    `whatsapp` VARCHAR(191) NULL,
    `instagram` VARCHAR(191) NULL,
    `facebook` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `hoursText` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Store_sellerId_slug_key` (`sellerId`, `slug`),
    INDEX `Store_sellerId_idx` (`sellerId`),
    INDEX `Store_locationId_idx` (`locationId`),
    INDEX `Store_slug_idx` (`slug`),
    PRIMARY KEY (`id`),
    CONSTRAINT `Store_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `Seller` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `Store_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Location` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

