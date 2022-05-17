/*
  Warnings:

  - You are about to drop the `ComplementaryActivity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ComplementaryActivityCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CourseCategoryActivitie` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ComplementaryActivity" DROP CONSTRAINT "ComplementaryActivity_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "ComplementaryActivity" DROP CONSTRAINT "ComplementaryActivity_courseId_fkey";

-- DropForeignKey
ALTER TABLE "ComplementaryActivity" DROP CONSTRAINT "ComplementaryActivity_userId_fkey";

-- DropForeignKey
ALTER TABLE "ComplementaryActivity" DROP CONSTRAINT "ComplementaryActivity_validatedBy_fkey";

-- DropForeignKey
ALTER TABLE "CourseCategoryActivitie" DROP CONSTRAINT "CourseCategoryActivitie_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "CourseCategoryActivitie" DROP CONSTRAINT "CourseCategoryActivitie_courseId_fkey";

-- DropTable
DROP TABLE "ComplementaryActivity";

-- DropTable
DROP TABLE "ComplementaryActivityCategory";

-- DropTable
DROP TABLE "CourseCategoryActivitie";

-- DropEnum
DROP TYPE "EStatus";
