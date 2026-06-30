import { Component, computed, effect, inject, OnDestroy, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { environment } from '../../../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, map } from 'rxjs';
import { MovieService } from '../../services/movie.service';
import { ShowtimeService } from '../../services/showtime.service';
import { SeatService } from '../../../booking/services/seat.service';
import { BookingService } from '../../../booking/services/booking.service';
import { AuthService } from '../../../auth/services/auth.service';
import { WalletService } from '../../../wallet/services/wallet.service';
import { SeatHubService } from '../../../booking/services/seat-hub.service';
import { Showtime } from '../../models/showtime.model';
import { Seat, SeatStatus, SeatType } from '../../../booking/models/seat.model';
import { Ticket } from '../../../booking/models/ticket.model';
import { SeatMap, SeatRow } from '../../components/seat-map/seat-map';
import { BookingSummary } from '../../components/booking-summary/booking-summary';
import { BookingSuccessModal } from '../../components/booking-success-modal/booking-success-modal';

@Component({
  selector: 'app-movie-detail',
  imports: [DatePipe, DecimalPipe, SeatMap, BookingSummary, BookingSuccessModal],
  templateUrl: './movie-detail.html',
  styleUrl: './movie-detail.css',
})
export class MovieDetail implements OnDestroy {
  readonly apiUrl = environment.apiUrl;
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private movieService = inject(MovieService);
  private showtimeService = inject(ShowtimeService);
  private seatService = inject(SeatService);
  private bookingService = inject(BookingService);
  private auth = inject(AuthService);
  private wallet = inject(WalletService);
  seatHub = inject(SeatHubService);

  SeatStatus = SeatStatus;
  SeatType = SeatType;

  private movieId$ = this.route.paramMap.pipe(map(p => p.get('id') ?? ''));

  movie = toSignal(this.movieId$.pipe(switchMap(id => this.movieService.getById(id))));
  showtimes = toSignal(
    this.movieId$.pipe(switchMap(id => this.showtimeService.getByMovieId(id))),
    { initialValue: [] }
  );

  selectedShowtime = signal<Showtime | null>(null);
  seats = signal<Seat[]>([]);
  selectedSeatIds = signal<Set<string>>(new Set());
  isLoadingSeats = signal(false);
  isBooking = signal(false);
  bookingError = signal('');
  bookedTickets = signal<Ticket[]>([]);

  timeLeft = signal(600);
  private timerRef: ReturnType<typeof setInterval> | null = null;

  constructor() {
    effect(() => {
      const count = this.selectedSeatIds().size;
      if (count > 0 && this.timerRef === null) {
        this.timerRef = setInterval(() => {
          this.timeLeft.update(t => {
            if (t <= 1) {
              this.clearTimer();
              this.selectedSeatIds.set(new Set());
              this.bookingError.set('เวลาเลือกที่นั่งหมดแล้ว กรุณาเลือกใหม่อีกครั้ง');
              return 0;
            }
            return t - 1;
          });
        }, 1000);
      } else if (count === 0 && this.timerRef !== null) {
        this.clearTimer();
        this.timeLeft.set(600);
      }
    });
  }

  seatsByRow = computed<SeatRow[]>(() => {
    const grouped = new Map<string, Seat[]>();
    for (const seat of this.seats()) {
      const row = seat.seatCode.charAt(0);
      if (!grouped.has(row)) grouped.set(row, []);
      grouped.get(row)!.push(seat);
    }
    return [...grouped.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([rowKey, rowSeats]) => {
        rowSeats.sort((a, b) => parseInt(a.seatCode.slice(1)) - parseInt(b.seatCode.slice(1)));
        const isVip = rowSeats.every(s => s.type === SeatType.VIP);
        const couples: [Seat, Seat][] = [];
        if (isVip) {
          for (let i = 0; i + 1 < rowSeats.length; i += 2) {
            couples.push([rowSeats[i], rowSeats[i + 1]]);
          }
        }
        return { rowKey, seats: rowSeats, isVip, couples };
      });
  });

  selectedSeats = computed(() => this.seats().filter(s => this.selectedSeatIds().has(s.id)));
  totalPrice = computed(() => this.selectedSeats().reduce((sum, s) => sum + s.price, 0));

  vipSeatPrice = computed(() => this.seats().find(s => s.type === SeatType.VIP)?.price ?? 0);
  normalSeatPrice = computed(() => this.seats().find(s => s.type === SeatType.Normal)?.price ?? 0);

  ngOnDestroy() {
    this.seatHub.disconnect();
    this.clearTimer();
  }

  private clearTimer(): void {
    if (this.timerRef !== null) {
      clearInterval(this.timerRef);
      this.timerRef = null;
    }
  }

  selectShowtime(showtime: Showtime) {
    if (this.selectedShowtime()?.id === showtime.id) return;
    this.selectedShowtime.set(showtime);
    this.selectedSeatIds.set(new Set());
    this.seats.set([]);
    this.bookingError.set('');
    this.isLoadingSeats.set(true);
    this.clearTimer();
    this.timeLeft.set(600);

    this.seatService.getByShowtimeId(showtime.id).subscribe({
      next: seats => {
        this.seats.set(seats);
        this.isLoadingSeats.set(false);
      },
      error: () => {
        this.bookingError.set('ไม่สามารถโหลดข้อมูลที่นั่งได้ กรุณาลองใหม่อีกครั้ง');
        this.isLoadingSeats.set(false);
      },
    });

    this.seatHub.connect(showtime.id, (seatId, newStatus) => {
      this.seats.update(all =>
        all.map(s => s.id === seatId ? { ...s, status: newStatus as SeatStatus } : s)
      );
    });
  }

  toggleSeat(seat: Seat) {
    if (seat.status !== SeatStatus.Available) return;
    const ids = new Set(this.selectedSeatIds());
    if (ids.has(seat.id)) ids.delete(seat.id);
    else ids.add(seat.id);
    this.selectedSeatIds.set(ids);
  }

  toggleCouple(s1: Seat, s2: Seat) {
    if (s1.status !== SeatStatus.Available || s2.status !== SeatStatus.Available) return;
    const ids = new Set(this.selectedSeatIds());
    const bothSelected = ids.has(s1.id) && ids.has(s2.id);
    if (bothSelected) { ids.delete(s1.id); ids.delete(s2.id); }
    else { ids.add(s1.id); ids.add(s2.id); }
    this.selectedSeatIds.set(ids);
  }

  bookSeats() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    const seats = this.selectedSeats();
    const showtime = this.selectedShowtime();
    if (seats.length === 0 || !showtime) return;

    this.isBooking.set(true);
    this.bookingError.set('');

    this.bookingService.bookBulk(seats.map(s => s.id), showtime.id).subscribe({
      next: (tickets: Ticket[]) => {
        const bookedIds = new Set(seats.map(s => s.id));
        this.seats.update(all =>
          all.map(s => bookedIds.has(s.id) ? { ...s, status: SeatStatus.Booked } : s)
        );
        this.selectedSeatIds.set(new Set());
        this.bookedTickets.set(tickets);
        this.isBooking.set(false);
        this.wallet.loadBalance();
      },
      error: (err: { error: { error?: string; title?: string; errors?: Record<string, string[]> } }) => {
        const body = err.error;
        const message = (typeof body?.error === 'string' ? body.error : null)
          ?? body?.title
          ?? (body?.errors ? Object.values(body.errors as Record<string, string[]>).flat().join(', ') : null)
          ?? 'เกิดข้อผิดพลาดในการจอง';
        this.bookingError.set(message);
        this.isBooking.set(false);
      },
    });
  }

  closeSuccessModal() {
    this.bookedTickets.set([]);
  }
}
