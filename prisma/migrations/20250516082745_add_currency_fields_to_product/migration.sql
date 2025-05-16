-- CreateEnum
CREATE TYPE "CouponStatus" AS ENUM ('Active', 'Used', 'Expired', 'Disabled');

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_product_id_fkey";

-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN     "status" "CouponStatus" NOT NULL DEFAULT 'Active';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "currency_image" TEXT,
ADD COLUMN     "currency_name" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "coupon_id" INTEGER,
ALTER COLUMN "identifier" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "method" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
