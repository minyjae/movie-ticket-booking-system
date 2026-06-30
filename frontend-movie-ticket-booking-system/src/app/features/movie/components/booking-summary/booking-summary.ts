import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Seat } from '../../../booking/models/seat.model';

@Component({
  selector: 'app-booking-summary',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './booking-summary.html',
})
export class BookingSummary {
  @Input({ required: true }) selectedSeats: Seat[] = [];
  @Input({ required: true }) totalPrice = 0;
  @Input() isBooking = false;
  @Input() bookingError = '';
  @Input() timeLeft = 600;

  @Output() bookClicked = new EventEmitter<void>();

  get selectedSeatCodes(): string {
    return this.selectedSeats.map(s => s.seatCode).join(', ');
  }

  get formattedTime(): string {
    const m = Math.floor(this.timeLeft / 60).toString().padStart(2, '0');
    const s = (this.timeLeft % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  get timerColorClass(): string {
    if (this.timeLeft < 30) return 'text-red-400';
    if (this.timeLeft < 120) return 'text-yellow-400';
    return 'text-white';
  }
}
