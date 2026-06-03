import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

export type SeatChangedCallback = (seatId: string, status: string) => void;

@Injectable({ providedIn: 'root' })
export class SeatHubService {
  private connection: signalR.HubConnection | null = null;
  isConnected = false;

  connect(showtimeId: string, onSeatChanged: SeatChangedCallback): void {
    this.disconnect();

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5074/hubs/seats')
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    this.connection.on('SeatStatusChanged', onSeatChanged);

    this.connection.onreconnected(() => {
      this.connection!.invoke('JoinShowtime', showtimeId).catch(() => {});
    });

    this.connection
      .start()
      .then(() => {
        this.isConnected = true;
        return this.connection!.invoke('JoinShowtime', showtimeId);
      })
      .catch(() => {
        this.isConnected = false;
      });
  }

  disconnect(): void {
    if (this.connection) {
      this.connection.stop().catch(() => {});
      this.connection = null;
      this.isConnected = false;
    }
  }
}
