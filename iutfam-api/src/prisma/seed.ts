import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.chat.upsert({
    where: { id: 'GENERAL_SINGLETON' },
    create: { id: 'GENERAL_SINGLETON', type: 'GENERAL' },
    update: {},
  });

  await prisma.classGroup.createMany({
    data: [
      { name: 'BUT RT1-A' },
      { name: 'BUT RT2-A' },
      { name: 'BUT RT2-B' },
    ],
    skipDuplicates: true,
  });
}

main().finally(async () => await prisma.$disconnect());
