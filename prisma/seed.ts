// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const now = new Date();

  // Получаем все подтверждённые отзывы
  const verifiedFeedbacks = await prisma.feedback.findMany({
    where: { isVerified: true },
    select: { id: true },
  });

  for (const feedback of verifiedFeedbacks) {
    const randomHours = Math.floor(Math.random() * 72);
    const randomDate = new Date(now.getTime() - randomHours * 60 * 60 * 1000);

    await prisma.feedback.update({
      where: { id: feedback.id },
      data: { created_at: randomDate },
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
