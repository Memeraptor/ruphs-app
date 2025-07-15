-- CreateTable
CREATE TABLE `factions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `factions_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `races` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `factionId` INTEGER NOT NULL,

    UNIQUE INDEX `races_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `classes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `armorType` VARCHAR(191) NOT NULL DEFAULT '',
    `colorCode` VARCHAR(191) NOT NULL DEFAULT '',

    UNIQUE INDEX `classes_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `race_classes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `raceId` INTEGER NOT NULL,
    `classId` INTEGER NOT NULL,

    UNIQUE INDEX `race_classes_raceId_classId_key`(`raceId`, `classId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `characters` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `level` INTEGER NOT NULL DEFAULT 1,
    `gender` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NOT NULL DEFAULT '',
    `raceId` INTEGER NOT NULL,
    `classId` INTEGER NOT NULL,

    UNIQUE INDEX `characters_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `races` ADD CONSTRAINT `races_factionId_fkey` FOREIGN KEY (`factionId`) REFERENCES `factions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `race_classes` ADD CONSTRAINT `race_classes_raceId_fkey` FOREIGN KEY (`raceId`) REFERENCES `races`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `race_classes` ADD CONSTRAINT `race_classes_classId_fkey` FOREIGN KEY (`classId`) REFERENCES `classes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `characters` ADD CONSTRAINT `characters_raceId_fkey` FOREIGN KEY (`raceId`) REFERENCES `races`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `characters` ADD CONSTRAINT `characters_classId_fkey` FOREIGN KEY (`classId`) REFERENCES `classes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
