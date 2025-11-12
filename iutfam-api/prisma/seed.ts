import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // ⚠️ Mets ici une valeur VALIDE de ton enum ChatType (ex: 'GROUP', 'DIRECT', 'CLASS', …)
  const chatType: any = 'GROUP';

  await prisma.chat.upsert({
    where: { id: 'general' },
    update: {},
    create: { id: 'general', type: chatType },
  });

  await prisma.user.upsert({
    where: { id: 'u_dev' },
    update: {},
    create: {
      id: 'u_dev',
      email: 'dev@iutfam.local',
      username: 'devuser',
      passwordHash: 'dev-hash',      // valeur factice suffisante pour la seed
      displayName: 'Careena (dev)',  // optionnel
    },
  });
}

main().finally(() => prisma.$disconnect());
