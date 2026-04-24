-- CreateTable
CREATE TABLE `RateLimitBucket` (
    `id` VARCHAR(191) NOT NULL,
    `scope` VARCHAR(191) NOT NULL,
    `bucketKey` VARCHAR(191) NOT NULL,
    `windowId` VARCHAR(191) NOT NULL,
    `count` INT NOT NULL DEFAULT 0,
    `expiresAt` DATETIME(3) NOT NULL,

    INDEX `RateLimitBucket_expiresAt_idx` (`expiresAt`),
    UNIQUE INDEX `RateLimitBucket_scope_bucketKey_windowId_key` (`scope`, `bucketKey`, `windowId`),
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
