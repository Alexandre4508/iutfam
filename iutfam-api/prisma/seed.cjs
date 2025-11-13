// prisma/seed.cjs (CommonJS)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // --- CHAT GENERAL SINGLETON ---
  await prisma.chat.upsert({
    where: { id: 'GENERAL_SINGLETON' },
    create: { id: 'GENERAL_SINGLETON', type: 'GENERAL' },
    update: {},
  });

  // --- GROUPES DE CLASSES ---
  await prisma.classGroup.createMany({
    data: [
      { name: 'BUT RT1-A' },
      { name: 'BUT RT2-A' },
      { name: 'BUT RT2-B' },
    ],
    skipDuplicates: true,
  });

  // --- UTILISATEUR DEV ---
  const user = await prisma.user.upsert({
    where: { id: 'u_dev' },
    update: {},
    create: {
      id: 'u_dev',
      email: 'dev@iutfam.local',
      username: 'devuser',
      passwordHash: 'dev-hash',
      displayName: 'Careena (dev)',
    },
  });

  // --- EVENEMENTS DE DEMO ---
  await prisma.event.createMany({
    data: [
      {
        title: 'Café Réseaux',
        description: 'Rencontre informelle des étudiants RT.',
        location: 'Salle B204',
        startsAt: new Date(Date.now() + 24 * 3600 * 1000), // demain
        endsAt: new Date(Date.now() + 26 * 3600 * 1000),
        createdById: user.id,
      },
      {
        title: 'Prépa CCNA',
        description: 'Session pratique OSPF/VLAN.',
        location: 'Lab Réseau',
        startsAt: new Date(Date.now() + 3 * 24 * 3600 * 1000),
        createdById: user.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seed OK : chat + groupes + user + events');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
