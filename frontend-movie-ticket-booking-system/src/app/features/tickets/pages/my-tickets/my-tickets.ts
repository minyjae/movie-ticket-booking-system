import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TicketService, Ticket } from '../../services/ticket.service';
import { WalletService } from '../../../wallet/services/wallet.service';

@Component({
  selector: 'app-my-tickets',
  imports: [DatePipe, DecimalPipe, RouterLink],
  templateUrl: './my-tickets.html',
})
export class MyTickets implements OnInit {
  private ticketService = inject(TicketService);
  private walletService = inject(WalletService);

  tickets = signal<Ticket[]>([]);
  isLoading = signal(true);
  error = signal('');
  selectedQr = signal<Ticket | null>(null);
  cancelConfirmId = signal<string | null>(null);
  cancellingId = signal<string | null>(null);
  cancelError = signal('');

  ngOnInit() {
    this.ticketService.getMyTickets().subscribe({
      next: (data) => {
        this.tickets.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('ไม่สามารถโหลดตั๋วได้ กรุณาลองใหม่อีกครั้ง');
        this.isLoading.set(false);
      },
    });
  }

  openQr(ticket: Ticket) {
    this.selectedQr.set(ticket);
  }

  closeQr() {
    this.selectedQr.set(null);
  }

  isUpcoming(showtime: string): boolean {
    return new Date(showtime) > new Date();
  }

  canCancel(ticket: Ticket): boolean {
    return !ticket.isCancelled && this.isUpcoming(ticket.showtime);
  }

  askCancel(id: string) {
    this.cancelError.set('');
    this.cancelConfirmId.set(id);
  }

  dismissCancel() {
    this.cancelConfirmId.set(null);
    this.cancelError.set('');
  }

  confirmCancel(id: string) {
    this.cancellingId.set(id);
    this.cancelError.set('');
    this.ticketService.cancel(id).subscribe({
      next: (updated) => {
        this.tickets.update((list) => list.map((t) => (t.id === updated.id ? updated : t)));
        this.cancelConfirmId.set(null);
        this.cancellingId.set(null);
        this.walletService.loadBalance();
      },
      error: (err) => {
        const body = err.error;
        const msg = (typeof body?.error === 'string' ? body.error : null)
          ?? 'ไม่สามารถยกเลิกตั๋วได้ กรุณาลองใหม่';
        this.cancelError.set(msg);
        this.cancellingId.set(null);
      },
    });
  }
}
