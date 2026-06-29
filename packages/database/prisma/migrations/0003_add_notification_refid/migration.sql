-- AlterTable: Add refId to notifications for linking to related records
ALTER TABLE "notifications" ADD COLUMN "refId" TEXT;
