/*
  Warnings:

  - You are about to drop the column `classId` on the `characters` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `classes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `races` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `specializationId` to the `characters` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `classes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `races` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `characters` DROP FOREIGN KEY `characters_classId_fkey`;

-- DropIndex
DROP INDEX `characters_classId_fkey` ON `characters`;

-- AlterTable
ALTER TABLE `characters` DROP COLUMN `classId`,
    ADD COLUMN `specializationId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `classes` ADD COLUMN `slug` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `races` ADD COLUMN `slug` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `specializations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `classId` INTEGER NOT NULL,

    UNIQUE INDEX `specializations_classId_name_key`(`classId`, `name`),
    UNIQUE INDEX `specializations_classId_slug_key`(`classId`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `classes_slug_key` ON `classes`(`slug`);

-- CreateIndex
CREATE UNIQUE INDEX `races_slug_key` ON `races`(`slug`);

-- AddForeignKey
ALTER TABLE `specializations` ADD CONSTRAINT `specializations_classId_fkey` FOREIGN KEY (`classId`) REFERENCES `classes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `characters` ADD CONSTRAINT `characters_specializationId_fkey` FOREIGN KEY (`specializationId`) REFERENCES `specializations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
