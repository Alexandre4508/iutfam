import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FriendStatus } from '@prisma/client';


@Injectable()
export class FriendsService {
  constructor(private readonly prisma: PrismaService) {}

  // Liste de mes amis (ACCEPTED)
   async getMyFriends(userId: string) {
    if (!userId) {
      throw new UnauthorizedException('Missing user id in token');
    }

    const rows = await this.prisma.friendRequest.findMany({
      where: {
        status: FriendStatus.ACCEPTED,
        OR: [
          { requesterId: userId },
          { addresseeId: userId },
        ],
      },
      include: {
        requester: true,
        addressee: true,
      },
    });

    return rows
      .map((f) => {
        const other =
          f.requesterId === userId ? f.addressee : f.requester;

        return {
          friendshipId: f.id,
          user: {
            id: other.id,
            email: other.email,
            username: other.username,
            displayName: other.displayName,
            department: (other as any).department ?? null,
          },
        };
      })
      // sécurité : on ne renvoie jamais moi-même comme ami
      .filter((f) => f.user.id !== userId);
  }

//Demandes reçues (PENDING où JE suis le destinataire)
  async getMyRequests(userId: string) {
    const reqs = await this.prisma.friendRequest.findMany({
      where: {
        status: FriendStatus.PENDING,
        addresseeId: userId,
      },
      include: {
        requester: true,
      },
    });

    return reqs.map((f) => ({
      friendshipId: f.id,
      from: {
        id: f.requester.id,
        email: f.requester.email,
        username: f.requester.username,
        displayName: f.requester.displayName,
        department: (f.requester as any).department ?? null,
      },
      createdAt: f.createdAt,
   }));
}

// Demandes d'amis que J'AI REÇUES (pour "M'ont ajouté")
async getMyIncomingRequests(userId: string) {

     if (!userId) {
    throw new UnauthorizedException('Missing user id in token');
  }

  const reqs = await this.prisma.friendRequest.findMany({
    where: {
      status: FriendStatus.PENDING,
      addresseeId: userId,      // 👈 JE SUIS LE DESTINATAIRE
    },
    include: {
      requester: true,          // 👈 celui qui m'a ajouté
    },
  });

  return reqs.map((f) => ({
    friendshipId: f.id,
    from: {
      id: f.requester.id,
      email: f.requester.email,
      username: f.requester.username,
      displayName: f.requester.displayName,
      department: (f.requester as any).department ?? null,
    },
    createdAt: f.createdAt,
  }));
}




  // Recherche d'autres étudiants
  async searchUsers(userId: string, q: string) {
    if (!q || q.trim().length < 2) {
      return [];
    }
    const query = q.trim();

    const users = await this.prisma.user.findMany({
      where: {
        id: { not: userId },
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { username: { contains: query, mode: 'insensitive' } },
          { displayName: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
    });

    // récupérer les friendships existantes pour savoir si déjà ami / en attente
    const ids = users.map((u) => u.id);
    const friendships = await this.prisma.friendRequest.findMany({
      where: {
        OR: [
          {
            requesterId: userId,
            addresseeId: { in: ids },
          },
          {
            addresseeId: userId,
            requesterId: { in: ids },
          },
        ],
      },
    });

    return users.map((u) => {
      const rel = friendships.find(
        (f) =>
          (f.requesterId === userId && f.addresseeId === u.id) ||
          (f.addresseeId === userId && f.requesterId === u.id),
      );

      return {
        id: u.id,
        email: u.email,
        username: u.username,
        displayName: u.displayName,
        department: (u as any).department ?? null,
        friendship: rel
          ? { id: rel.id, status: rel.status, requesterId: rel.requesterId, addresseeId: rel.addresseeId }
          : null,
      };
    });
  }

  // Envoyer une demande
  async sendRequest(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throw new BadRequestException("Tu ne peux pas t'ajouter toi-même");
    }

    const target = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!target) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    // vérifier si une relation existe déjà
    const existing = await this.prisma.friendRequest.findFirst({
      where: {
        OR: [
          { requesterId: userId, addresseeId: targetUserId },
          { requesterId: targetUserId, addresseeId: userId },
        ],
      },
    });

    if (existing) {
      if (existing.status === FriendStatus.PENDING) {
        throw new BadRequestException('Une demande est déjà en attente');
      }
      if (existing.status === FriendStatus.ACCEPTED) {
        throw new BadRequestException('Vous êtes déjà amis');
      }
    }

    const f = await this.prisma.friendRequest.create({
      data: {
        requesterId: userId,
        addresseeId: targetUserId,
      },
    });

    return f;
  }

  // Accepter une demande
  async accept(userId: string, friendshipId: string) {
    const f = await this.prisma.friendRequest.findUnique({ where: { id: friendshipId } });
    if (!f) throw new NotFoundException('Demande introuvable');

    if (f.addresseeId !== userId) {
      throw new ForbiddenException('Tu ne peux accepter que tes propres demandes reçues');
    }

    return this.prisma.friendRequest.update({
      where: { id: friendshipId },
      data: { status: FriendStatus.ACCEPTED },
    });
  }

  // Refuser / annuler
  async reject(userId: string, friendshipId: string) {
    const f = await this.prisma.friendRequest.findUnique({ where: { id: friendshipId } });
    if (!f) throw new NotFoundException('Demande introuvable');

    if (f.addresseeId !== userId && f.requesterId !== userId) {
      throw new ForbiddenException("Tu n'es pas concerné par cette demande");
    }

    // soit on supprime, soit on marque REJECTED
    return this.prisma.friendRequest.update({
      where: { id: friendshipId },
      data: { status: FriendStatus.REJECTED },
    });
  }
}
