// prisma/seed.cjs (CommonJS)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Chat GENERAL singleton
  await prisma.chat.upsert({
    where: { id: 'GENERAL_SINGLETON' },
    create: { id: 'GENERAL_SINGLETON', type: 'GENERAL' },
    update: {},
  });

  // Groupes de classes
  await prisma.classGroup.createMany({
    data: [
      { name: 'BUT RT1-A' },
      { name: 'BUT RT2-A' },
      { name: 'BUT RT2-B' },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(async () => {
    console.log('✅ Seed OK');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
