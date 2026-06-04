import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/services/auth.service';
import { Screen } from '../models/screen.model';
import { environment } from '../../../../environments/environment';

export interface CreateScreenPayload {
  name: string;
  vipRows: number;
  vipSeatsPerRow: number;
  normalRows: number;
  normalSeatsPerRow: number;
}

@Injectable({ providedIn: 'root' })
export class ScreenService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private readonly baseUrl = `${environment.apiUrl}/api/screens`;

  private get options() {
    return { headers: { Authorization: `Bearer ${this.auth.getToken()}` } };
  }

  getAll() {
    return this.http.get<Screen[]>(this.baseUrl);
  }

  create(payload: CreateScreenPayload) {
    return this.http.post<Screen>(this.baseUrl, payload, this.options);
  }

  delete(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`, this.options);
  }
}
