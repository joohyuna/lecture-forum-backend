-- AlterTable
ALTER TABLE `Post` ADD COLUMN `option1Text` VARCHAR(191) NULL,
    ADD COLUMN `option2Text` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Vote` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `option` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `postId` INTEGER NOT NULL,

    INDEX `Vote_postId_idx`(`postId`),
    INDEX `Vote_userId_idx`(`userId`),
    UNIQUE INDEX `Vote_userId_postId_key`(`userId`, `postId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
