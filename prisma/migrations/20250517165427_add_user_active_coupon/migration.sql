/*
  Warnings:

  - You are about to drop the column `coupon_id` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_coupon_id_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "coupon_id",
ADD COLUMN     "active_coupon_id" INTEGER,
ADD COLUMN     "active_discount" INTEGER,
ALTER COLUMN "birth_date" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "UsedCoupon" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "coupon_id" INTEGER NOT NULL,
    "used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsedCoupon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UsedCoupon_user_id_coupon_id_key" ON "UsedCoupon"("user_id", "coupon_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_active_coupon_id_fkey" FOREIGN KEY ("active_coupon_id") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsedCoupon" ADD CONSTRAINT "UsedCoupon_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsedCoupon" ADD CONSTRAINT "UsedCoupon_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "Coupon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
