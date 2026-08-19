import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async getConversations(userId: string) {
    const messages = await this.prisma.chatMessage.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true, role: true } },
        receiver: { select: { id: true, name: true, avatarUrl: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const conversationMap = new Map();

    messages.forEach((msg) => {
      const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
      if (!conversationMap.has(otherUser.id)) {
        conversationMap.set(otherUser.id, {
          user: otherUser,
          lastMessage: msg,
        });
      }
    });

    return Array.from(conversationMap.values());
  }

  async getMessages(userId: string, otherUserId: string) {
    const messages = await this.prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Mark as read
    await this.prisma.chatMessage.updateMany({
      where: { senderId: otherUserId, receiverId: userId, read: false },
      data: { read: true },
    });

    return messages;
  }

  async saveMessage(senderId: string, receiverId: string, body: string) {
    return this.prisma.chatMessage.create({
      data: { senderId, receiverId, body },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
  }
}
