import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';
import { environment } from '../../../../environments/environment';

interface WalletResponse {
  userId: string;
  balance: number;
}

export type LedgerEntryType = 'Deposit' | 'TicketPurchase' | 'Refund';

export interface LedgerEntry {
  id: string;
  amount: number;
  type: LedgerEntryType;
  description: string;
  referenceId: string | null;
  createdAt: string;
}

export interface WalletHistory {
  balance: number;
  total: number;
  page: number;
  pageSize: number;
  entries: LedgerEntry[];
}

@Injectable({ providedIn: 'root' })
export class WalletService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private readonly baseUrl = `${environment.apiUrl}/api/wallet`;

  private _balance = signal<number | null>(null);
  balance = this._balance.asReadonly();

  private get options() {
    return { headers: { Authorization: `Bearer ${this.auth.getToken()}` } };
  }

  loadBalance() {
    this.http.get<WalletResponse>(`${this.baseUrl}/balance`, this.options)
      .subscribe({ next: res => this._balance.set(res.balance) });
  }

  deposit(amount: number) {
    return this.http.post<WalletResponse>(
      `${this.baseUrl}/deposit`, { amount }, this.options
    ).pipe(tap(res => this._balance.set(res.balance)));
  }

  getHistory(page = 1, pageSize = 20) {
    return this.http.get<WalletHistory>(
      `${this.baseUrl}/history?page=${page}&pageSize=${pageSize}`,
      this.options
    );
  }

  clearBalance() {
    this._balance.set(null);
  }
}
