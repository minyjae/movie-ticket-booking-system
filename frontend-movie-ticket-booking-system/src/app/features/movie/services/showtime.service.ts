import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Showtime } from '../models/showtime.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ShowtimeService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/showtimes`;

  getAll(token: string) {
    return this.http.get<Showtime[]>(this.baseUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  getByMovieId(movieId: string) {
    return this.http.get<Showtime[]>(`${this.baseUrl}/movie/${movieId}`);
  }
}
