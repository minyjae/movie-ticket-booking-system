import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TicketService, Ticket } from '../../services/ticket.service';

@Component({
  selector: 'app-my-tickets',
  imports: [DatePipe, DecimalPipe, RouterLink],
  templateUrl: './my-tickets.html',
})
export class MyTickets implements OnInit {
  private ticketService = inject(TicketService);

  tickets = signal<Ticket[]>([]);
  isLoading = signal(true);
  error = signal('');
  selectedQr = signal<Ticket | null>(null);

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
}
