-- Add soft delete columns to users table
ALTER TABLE "users" ADD COLUMN "deleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "deleted_at" TIMESTAMP;