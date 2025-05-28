import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Reset auto-increment for User.id to start from 20000
  await prisma.$executeRawUnsafe(`
    ALTER SEQUENCE "Order_id_seq" RESTART WITH 20000;
  `);

  // Optional: create some seed users
  await prisma.order.create({
    data: {
      identifier: 'erlanzh.gg@gmail.com',
      user_id: 1, // замените на существующий user.id
      product_id: 1, // замените на существующий product.id
      item_id: 0,
      payment: 'tbank',
    },
  });
}

main()
  .then(() => {
    console.log('Seeding completed.');
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
