import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({ cors: { origin: '*' } })
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private messagesService: MessagesService,
    private jwtService: JwtService
  ) {}

  async handleConnection(socket: Socket) {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    if (!token) {
      socket.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify(token);
      this.connectedUsers.set(payload.sub, socket.id);
      console.log(`User connected: ${payload.sub} (Socket: ${socket.id})`);
    } catch (e) {
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === socket.id) {
        this.connectedUsers.delete(userId);
        console.log(`User disconnected: ${userId}`);
        break;
      }
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { receiverId: string; body: string }
  ) {
    const senderId = Array.from(this.connectedUsers.entries()).find(
      ([_, socketId]) => socketId === socket.id
    )?.[0];

    if (!senderId) return;

    const message = await this.messagesService.saveMessage(senderId, data.receiverId, data.body);

    // Send to receiver if online
    const receiverSocketId = this.connectedUsers.get(data.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('newMessage', message);
    }

    // Send back to sender for confirmation/sync
    socket.emit('messageSent', message);
  }
}
