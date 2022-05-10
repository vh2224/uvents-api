-- DropIndex
DROP INDEX "Course_name_key";

-- AlterTable
ALTER TABLE "State" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
