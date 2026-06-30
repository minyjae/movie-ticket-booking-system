import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Seat, SeatStatus, SeatType } from '../../../booking/models/seat.model';

export interface SeatRow {
  rowKey: string;
  seats: Seat[];
  isVip: boolean;
  couples: [Seat, Seat][];
}

@Component({
  selector: 'app-seat-map',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './seat-map.html',
  styleUrl: './seat-map.css',
})
export class SeatMap {
  @Input({ required: true }) seatsByRow: SeatRow[] = [];
  @Input({ required: true }) selectedSeatIds: Set<string> = new Set();
  @Input() isLoading = false;
  @Input() vipSeatPrice = 0;
  @Input() normalSeatPrice = 0;

  @Output() seatToggled = new EventEmitter<Seat>();
  @Output() coupleToggled = new EventEmitter<[Seat, Seat]>();

  SeatStatus = SeatStatus;
  SeatType = SeatType;

  getSeatClass(seat: Seat): string {
    if (this.selectedSeatIds.has(seat.id)) return 'seat seat-selected';
    if (seat.status === SeatStatus.Booked) return 'seat seat-booked';
    if (seat.status === SeatStatus.Locked) return 'seat seat-locked';
    return 'seat seat-available';
  }

  getCoupleSeatClass(s1: Seat, s2: Seat): string {
    const base = 'couple-seat ';
    if (s1.status === SeatStatus.Booked || s2.status === SeatStatus.Booked) return base + 'seat-booked';
    if (s1.status === SeatStatus.Locked || s2.status === SeatStatus.Locked) return base + 'seat-locked';
    if (this.selectedSeatIds.has(s1.id) && this.selectedSeatIds.has(s2.id)) return base + 'seat-selected';
    return base + 'seat-vip';
  }
}
