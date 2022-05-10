-- DropForeignKey
ALTER TABLE "ComplementaryActivity" DROP CONSTRAINT "ComplementaryActivity_validatedBy_fkey";

-- AlterTable
ALTER TABLE "ComplementaryActivity" ALTER COLUMN "validatedBy" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ComplementaryActivity" ADD CONSTRAINT "ComplementaryActivity_validatedBy_fkey" FOREIGN KEY ("validatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
