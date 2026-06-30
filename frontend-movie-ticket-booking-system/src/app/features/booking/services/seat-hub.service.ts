import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../../environments/environment';

export type SeatChangedCallback = (seatId: string, status: string) => void;

@Injectable({ providedIn: 'root' })
export class SeatHubService {
  private connection: signalR.HubConnection | null = null;
  isConnected = signal(false);

  connect(showtimeId: string, onSeatChanged: SeatChangedCallback): void {
    this.disconnect();

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/hubs/seats`)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    this.connection.on('SeatStatusChanged', onSeatChanged);

    this.connection.onreconnected(() => {
      this.isConnected.set(true);
      this.connection!.invoke('JoinShowtime', showtimeId)
        .catch(err => console.error('[SeatHub] Failed to rejoin after reconnect:', err));
    });

    this.connection
      .start()
      .then(() => {
        this.isConnected.set(true);
        return this.connection!.invoke('JoinShowtime', showtimeId);
      })
      .catch(err => {
        this.isConnected.set(false);
        console.error('[SeatHub] Failed to connect:', err);
      });
  }

  disconnect(): void {
    if (this.connection) {
      this.connection.stop().catch(() => {});
      this.connection = null;
      this.isConnected.set(false);
    }
  }
}
