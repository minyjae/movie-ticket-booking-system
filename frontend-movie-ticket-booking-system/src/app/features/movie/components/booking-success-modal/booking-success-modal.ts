import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Ticket } from '../../../booking/models/ticket.model';

@Component({
  selector: 'app-booking-success-modal',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  templateUrl: './booking-success-modal.html',
})
export class BookingSuccessModal {
  @Input({ required: true }) tickets: Ticket[] = [];
  @Output() closed = new EventEmitter<void>();
}
