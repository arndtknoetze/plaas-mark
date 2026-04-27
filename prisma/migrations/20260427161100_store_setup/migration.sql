-- CreateTable
CREATE TABLE `Store` (
    `id` VARCHAR(191) NOT NULL,
    `sellerId` VARCHAR(191) NOT NULL,
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
    INDEX `Store_slug_idx` (`slug`),
    PRIMARY KEY (`id`),
    CONSTRAINT `Store_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `Seller` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

