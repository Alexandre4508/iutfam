import {
  MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer,
  ConnectedSocket, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

type UserLite = { id: string; username?: string; displayName?: string };

@WebSocketGateway({
  cors: { origin: ['http://localhost:3000'], credentials: true }
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;

  constructor(
    private readonly messages: MessagesService,
    private readonly jwt: JwtService,
    private readonly cfg: ConfigService,
  ) {}

  afterInit() { console.log('💬 ChatGateway initialisée'); }

  private getTokenFromCookie(cookieHeader?: string | string[]): string | null {
    const raw = Array.isArray(cookieHeader) ? cookieHeader.join('; ') : (cookieHeader || '');
    const match = raw.match(/(?:^|;\s*)access_token=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }

  private getUserFromSocket(client: Socket): UserLite | null {
    try {
      const token = this.getTokenFromCookie(client.handshake.headers.cookie);
      if (!token) return null;
      const secret = this.cfg.get<string>('JWT_SECRET') ?? 'dev-secret';
      const payload: any = this.jwt.verify(token, { secret });
      // tu peux ajouter email si tu veux
      return { id: payload.sub, username: payload.username, displayName: payload.displayName };
    } catch {
      return null;
    }
  }

  handleConnection(client: Socket) {
    const u = this.getUserFromSocket(client);
    client.data.user = u; // attaché à la socket
    console.log('Client connecté:', client.id, 'user=', u?.id ?? 'anon');
  }

  handleDisconnect(client: Socket) {
    console.log('Client déconnecté:', client.id);
  }

  // Rejoint une room + récupère l'historique
  @SubscribeMessage('chat:join')
  async onJoin(@MessageBody() data: { chatId: string; limit?: number }, @ConnectedSocket() client: Socket) {
    const chatId = data.chatId || 'GENERAL_SINGLETON';
    client.join(chatId);
    const history = await this.messages.listRecent(chatId, data.limit ?? 50);
    client.emit('chat:history', { chatId, messages: history });
  }

  // Envoi d'un message → on ignore senderId côté client, on prend l'user attaché à la socket
  @SubscribeMessage('message:send')
  async onSend(@MessageBody() data: { chatId: string; content: string; senderId?: string }, @ConnectedSocket() client: Socket) {
    const u: UserLite | null = client.data.user ?? null;
    const senderId = u?.id ?? data.senderId ?? 'u_dev';
    const saved = await this.messages.create({ chatId: data.chatId, content: data.content, senderId });
    this.server.to(data.chatId).emit('message:new', saved);
  }

  // Indicateurs de frappe → on propage aussi le nom
  @SubscribeMessage('typing:start')
  onTypingStart(@MessageBody() d: { chatId: string }, @ConnectedSocket() client: Socket) {
    const u: UserLite | null = client.data.user ?? null;
    this.server.to(d.chatId || 'GENERAL_SINGLETON').emit('typing:update', {
      chatId: d.chatId,
      typing: true,
      user: { id: u?.id ?? 'u_dev', username: u?.username, displayName: u?.displayName },
    });
  }

  @SubscribeMessage('typing:stop')
  onTypingStop(@MessageBody() d: { chatId: string }, @ConnectedSocket() client: Socket) {
    const u: UserLite | null = client.data.user ?? null;
    this.server.to(d.chatId || 'GENERAL_SINGLETON').emit('typing:update', {
      chatId: d.chatId,
      typing: false,
      user: { id: u?.id ?? 'u_dev', username: u?.username, displayName: u?.displayName },
    });
  }
}
