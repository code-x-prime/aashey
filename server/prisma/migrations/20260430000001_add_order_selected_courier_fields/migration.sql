-- Add selected courier fields to Order table for Shiprocket integration
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "selectedCourierId" INTEGER;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "selectedCourierName" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "selectedCourierRate" DECIMAL(10,2);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "selectedCourierEtd" TEXT;
