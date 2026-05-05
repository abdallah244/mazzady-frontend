import { Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private auctionSocket: Socket | null = null;
  public connected = signal(false);

  constructor() {}

  connectToAuctions() {
    if (this.auctionSocket?.connected) return this.auctionSocket;

    this.auctionSocket = io(`${environment.apiUrl}/auctions`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    this.auctionSocket.on('connect', () => {
      this.connected.set(true);
      console.log('Connected to auctions namespace');
    });

    this.auctionSocket.on('disconnect', () => {
      this.connected.set(false);
      console.log('Disconnected from auctions namespace');
    });

    return this.auctionSocket;
  }

  joinAuction(auctionId: string) {
    const socket = this.connectToAuctions();
    socket.emit('joinAuction', { auctionId });
  }

  leaveAuction(auctionId: string) {
    if (this.auctionSocket) {
      this.auctionSocket.emit('leaveAuction', { auctionId });
    }
  }

  onNewBid(callback: (data: any) => void) {
    const socket = this.connectToAuctions();
    socket.on('newBid', callback);
  }

  onAuctionEnded(callback: (data: any) => void) {
    const socket = this.connectToAuctions();
    socket.on('auctionEnded', callback);
  }

  disconnect() {
    if (this.auctionSocket) {
      this.auctionSocket.disconnect();
      this.auctionSocket = null;
    }
  }
}
