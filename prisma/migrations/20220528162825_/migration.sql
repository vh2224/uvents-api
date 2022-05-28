/*
  Warnings:

  - Made the column `cep` on table `Event` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "cep" SET NOT NULL;
