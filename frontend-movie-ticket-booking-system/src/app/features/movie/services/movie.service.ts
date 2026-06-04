import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Movie } from '../models/movie.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MovieService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/movies`;

  getAll() {
    return this.http.get<Movie[]>(this.baseUrl);
  }

  getById(id: string) {
    return this.http.get<Movie>(`${this.baseUrl}/${id}`);
  }
}
