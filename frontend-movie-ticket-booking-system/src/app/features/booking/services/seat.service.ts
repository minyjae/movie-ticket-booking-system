import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Seat } from '../models/seat.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SeatService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/seats`;

  getByShowtimeId(showtimeId: string) {
    return this.http.get<Seat[]>(`${this.baseUrl}/showtime/${showtimeId}`);
  }
}
