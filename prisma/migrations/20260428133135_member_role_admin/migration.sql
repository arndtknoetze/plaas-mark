-- AlterTable
ALTER TABLE `Member` ADD COLUMN `role` ENUM('MEMBER', 'ADMIN') NOT NULL DEFAULT 'MEMBER';

-- AlterTable
ALTER TABLE `Order` MODIFY `notes` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Store` ALTER COLUMN `locationId` DROP DEFAULT,
    MODIFY `addressText` VARCHAR(191) NULL,
    MODIFY `hoursText` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `AnalyticsSession` (
    `id` VARCHAR(191) NOT NULL,
    `anonId` VARCHAR(191) NOT NULL,
    `memberId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastSeenAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `AnalyticsSession_anonId_key`(`anonId`),
    INDEX `AnalyticsSession_memberId_idx`(`memberId`),
    INDEX `AnalyticsSession_lastSeenAt_idx`(`lastSeenAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnalyticsEvent` (
    `id` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `referrer` VARCHAR(191) NULL,
    `locale` VARCHAR(191) NULL,
    `locationId` VARCHAR(191) NULL,
    `storeId` VARCHAR(191) NULL,
    `orderId` VARCHAR(191) NULL,
    `ipHash` VARCHAR(191) NULL,
    `userAgent` TEXT NULL,
    `browserName` VARCHAR(191) NULL,
    `browserVersion` VARCHAR(191) NULL,
    `osName` VARCHAR(191) NULL,
    `osVersion` VARCHAR(191) NULL,
    `deviceVendor` VARCHAR(191) NULL,
    `deviceModel` VARCHAR(191) NULL,
    `deviceType` VARCHAR(191) NULL,
    `isMobile` BOOLEAN NULL,
    `isBot` BOOLEAN NULL,
    `props` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AnalyticsEvent_sessionId_createdAt_idx`(`sessionId`, `createdAt`),
    INDEX `AnalyticsEvent_type_createdAt_idx`(`type`, `createdAt`),
    INDEX `AnalyticsEvent_locationId_createdAt_idx`(`locationId`, `createdAt`),
    INDEX `AnalyticsEvent_storeId_createdAt_idx`(`storeId`, `createdAt`),
    INDEX `AnalyticsEvent_orderId_idx`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AnalyticsSession` ADD CONSTRAINT `AnalyticsSession_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnalyticsEvent` ADD CONSTRAINT `AnalyticsEvent_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `AnalyticsSession`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnalyticsEvent` ADD CONSTRAINT `AnalyticsEvent_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnalyticsEvent` ADD CONSTRAINT `AnalyticsEvent_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnalyticsEvent` ADD CONSTRAINT `AnalyticsEvent_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
