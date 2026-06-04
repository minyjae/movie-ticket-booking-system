import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/services/auth.service';

export interface Ticket {
  id: string;
  movieName: string;
  seatCode: string;
  showtime: string;
  pricePaid: number;
  referenceCode: string;
  qrCodeBase64: string;
  issuedAt: string;
  isCancelled: boolean;
  cancelledAt: string | null;
}

@Injectable({ providedIn: 'root' })
export class TicketService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private readonly baseUrl = 'http://localhost:5074/api/tickets';

  private get options() {
    return { headers: { Authorization: `Bearer ${this.auth.getToken()}` } };
  }

  getMyTickets() {
    return this.http.get<Ticket[]>(`${this.baseUrl}/my`, this.options);
  }

  cancel(ticketId: string) {
    return this.http.post<Ticket>(`${this.baseUrl}/${ticketId}/cancel`, {}, this.options);
  }
}
