// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany();
  const users = await prisma.user.findMany();
  for (const p of products) {
    const newImage = p.image.replace('don-vip.online', 'don-vip.com');
    const newCurrencyImage = p.currency_image
      ? p.currency_image.replace('don-vip.online', 'don-vip.com')
      : null;

    // 2) Обновляем каждую запись
    await prisma.product.update({
      where: { id: p.id },
      data: {
        image: newImage,
        currency_image: newCurrencyImage,
      },
    });
  }
  for (const u of users) {
    const newAvatar = u.avatar
      ? u.avatar.replace('don-vip.online', 'don-vip.com')
      : null;

    // 2) Обновляем каждую запись
    await prisma.user.update({
      where: { id: u.id },
      data: {
        avatar: newAvatar,
      },
    });
  }
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
