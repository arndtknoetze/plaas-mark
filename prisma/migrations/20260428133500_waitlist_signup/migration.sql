-- Waitlist signups for beta launch notifications.
CREATE TABLE `WaitlistSignup` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `emailLower` VARCHAR(191) NOT NULL,
    `source` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`),
    UNIQUE INDEX `WaitlistSignup_emailLower_key` (`emailLower`),
    INDEX `WaitlistSignup_createdAt_idx` (`createdAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

