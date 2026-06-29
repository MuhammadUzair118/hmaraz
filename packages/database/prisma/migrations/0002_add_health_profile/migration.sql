-- AlterTable: Add healthProfile JSON field to user_profiles
ALTER TABLE "user_profiles" ADD COLUMN "healthProfile" JSONB;
