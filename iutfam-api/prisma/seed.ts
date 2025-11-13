import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // ⚠️ Mets ici une valeur VALIDE de ton enum ChatType (ex: 'GROUP', 'DIRECT', 'CLASS', …)
  const chatType: any = 'GROUP';

  // ---- CHAT GENERAL ----
  await prisma.chat.upsert({
    where: { id: 'general' },
    update: {},
    create: { id: 'general', type: chatType },
  });

  // ---- UTILISATEUR DEV ----
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

  // ---- EVENEMENTS DE DEMO ----
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

  console.log('✅ Seed terminée : chat + user + events');
}

main().finally(() => prisma.$disconnect());
