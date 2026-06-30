import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';
import { environment } from '../../../../environments/environment';
import { Ticket } from '../models/ticket.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly baseUrl = `${environment.apiUrl}/api/bookings`;
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private get options() {
    return { headers: { Authorization: `Bearer ${this.auth.getToken()}` } };
  }

  book(seatId: string, showtimeId: string): Observable<Ticket> {
    return this.http.post<Ticket>(this.baseUrl, { seatId, showtimeId }, this.options);
  }

  bookBulk(seatIds: string[], showtimeId: string): Observable<Ticket[]> {
    return this.http.post<Ticket[]>(`${this.baseUrl}/bulk`, { seatIds, showtimeId }, this.options);
  }
}
