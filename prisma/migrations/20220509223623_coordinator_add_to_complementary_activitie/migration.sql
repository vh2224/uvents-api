/*
  Warnings:

  - Added the required column `validatedBy` to the `ComplementaryActivity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ComplementaryActivity" ADD COLUMN     "validatedBy" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ComplementaryActivity" ADD CONSTRAINT "ComplementaryActivity_validatedBy_fkey" FOREIGN KEY ("validatedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
