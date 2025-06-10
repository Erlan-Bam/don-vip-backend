// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.user.update({
    where: { identifier: 'hoyakap@gmail.com' },
    data: {
      role: 'Admin',
    },
  });
}

main()
  .then(() => {
    console.log('Миграция доменов изображений завершена.');
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
