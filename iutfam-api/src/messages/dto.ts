// iutfam-api/src/messages/dto.ts
export class CreateMessageDto {
  chatId!: string;
  content!: string;
  senderId?: string; //  prend depuis le JWT
}
