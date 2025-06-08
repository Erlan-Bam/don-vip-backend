import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Reset auto-increment for User.id to start from 20000
  await prisma.$executeRawUnsafe(`
    ALTER SEQUENCE "Order_id_seq" RESTART WITH 20000;
  `);
  await prisma.bank.create({
    data: {
      name: 'T-Bank',
      isActive: true,
    },
  });
  await prisma.bank.create({
    data: {
      name: 'SBP',
      isActive: true,
    },
  });
  await prisma.bank.create({
    data: {
      name: 'Card',
      isActive: true,
    },
  });
  await prisma.website.create({ data: { isTechWorks: false } });
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
