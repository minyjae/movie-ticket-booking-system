import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../auth/services/auth.service';
import { MovieService } from '../../movie/services/movie.service';
import { ShowtimeService } from '../../movie/services/showtime.service';
import { SeatService } from '../../booking/services/seat.service';
import { BannerService } from '../../banner/services/banner.service';
import { MovieCategory, Movie } from '../../movie/models/movie.model';
import { Showtime } from '../../movie/models/showtime.model';
import { Seat, SeatStatus, SeatType } from '../../booking/models/seat.model';
import { Banner } from '../../banner/models/banner.model';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-admin-dashboard',
  imports: [FormsModule, NgSelectModule, DatePipe],
  templateUrl: './dashboard.html',
})
export class AdminDashboard {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private movieService = inject(MovieService);
  private showtimeService = inject(ShowtimeService);
  private seatService = inject(SeatService);
  private bannerService = inject(BannerService);

  private readonly moviesUrl = 'http://localhost:5074/api/movies';
  private readonly showtimesUrl = 'http://localhost:5074/api/showtimes';

  movies = signal<Movie[]>([]);
  categories = Object.values(MovieCategory);

  constructor() {
    this.movieService.getAll().subscribe({ next: (data) => this.movies.set(data) });
  }

  activeTab = signal<'banner' | 'movie' | 'showtime' | 'manage'>('movie');

  SeatStatus = SeatStatus;
  SeatType = SeatType;

  // ── Movie form ──
  movieForm = { title: '', plot: '', price: null as number | null, durationHours: 0, durationMinutes: 0, durationSeconds: 0, category: null as MovieCategory | null };
  movieMessage = signal('');
  movieError = signal('');
  posterFile: File | null = null;
  posterPreviewUrl = signal('');

  // ── Showtime form ──
  showtimeForm = { movieId: null as string | null, screenId: '', startTime: '' };
  showtimeMessage = signal('');
  showtimeError = signal('');
  selectedShowtimeMovie = signal<Movie | null>(null);

  onShowtimeMovieChange(movieId: string | null) {
    this.selectedShowtimeMovie.set(this.movies().find((m) => m.id === movieId) ?? null);
  }

  // ── Banner tab ──
  banners = signal<Banner[]>([]);
  bannerMessage = signal('');
  bannerError = signal('');
  bannerLoading = signal(false);

  bannerFile: File | null = null;
  bannerPreviewUrl = signal('');
  bannerForm = { title: '', tagline: '', genre: null as string | null };

  editingBanner = signal<Banner | null>(null);
  editForm = { title: '', tagline: '', genre: null as string | null };

  // ── Manage Showtimes tab ──
  allShowtimes = signal<Showtime[]>([]);
  showtimeListLoading = signal(false);
  expandedId = signal<string | null>(null);
  seatCache = signal<Map<string, Seat[]>>(new Map());
  seatsLoadingId = signal<string | null>(null);
  deleteConfirmId = signal<string | null>(null);
  deleteLoading = signal(false);
  manageMessage = signal('');
  manageError = signal('');

  private get headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  // ── Banner methods ──
  onBannerTabOpen() {
    this.bannerService.getAll().subscribe({ next: (data) => this.banners.set(data) });
  }

  onBannerSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.bannerFile = file;
    this.bannerPreviewUrl.set(URL.createObjectURL(file));
  }

  uploadBanner() {
    if (!this.bannerFile) { this.bannerError.set('กรุณาเลือกไฟล์รูปภาพ'); return; }
    if (!this.bannerForm.title) { this.bannerError.set('กรุณากรอกชื่อ banner'); return; }

    this.bannerMessage.set('');
    this.bannerError.set('');
    this.bannerLoading.set(true);

    this.bannerService.upload(
      { ...this.bannerForm, genre: this.bannerForm.genre ?? '', image: this.bannerFile },
      this.headers,
    ).subscribe({
      next: (banner) => {
        this.banners.update((list) => [...list, banner]);
        this.bannerFile = null;
        this.bannerPreviewUrl.set('');
        this.bannerForm = { title: '', tagline: '', genre: '' };
        this.bannerMessage.set('เพิ่ม banner สำเร็จ');
        this.bannerLoading.set(false);
      },
      error: (err) => {
        this.bannerError.set(err.error?.error ?? err.error?.message ?? 'เกิดข้อผิดพลาด');
        this.bannerLoading.set(false);
      },
    });
  }

  startEdit(banner: Banner) {
    this.editingBanner.set(banner);
    this.editForm = { title: banner.title, tagline: banner.tagline, genre: banner.genre };
  }

  cancelEdit() {
    this.editingBanner.set(null);
  }

  saveEdit() {
    const banner = this.editingBanner();
    if (!banner) return;
    this.bannerMessage.set('');
    this.bannerError.set('');

    this.bannerService.update({ id: banner.id, ...this.editForm, genre: this.editForm.genre ?? undefined }, this.headers).subscribe({
      next: (updated) => {
        this.banners.update((list) => list.map((b) => (b.id === updated.id ? updated : b)));
        this.editingBanner.set(null);
        this.bannerMessage.set('แก้ไข banner สำเร็จ');
      },
      error: (err) => this.bannerError.set(err.error?.error ?? 'เกิดข้อผิดพลาด'),
    });
  }

  deleteBanner(id: string) {
    this.bannerMessage.set('');
    this.bannerError.set('');

    this.bannerService.delete(id, this.headers).subscribe({
      next: () => {
        this.banners.update((list) => list.filter((b) => b.id !== id));
        if (this.editingBanner()?.id === id) this.editingBanner.set(null);
        this.bannerMessage.set('ลบ banner สำเร็จ');
      },
      error: (err) => this.bannerError.set(err.error?.error ?? 'เกิดข้อผิดพลาด'),
    });
  }

  // ── Movie methods ──
  onPosterSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.posterFile = file;
    this.posterPreviewUrl.set(URL.createObjectURL(file));
  }

  submitMovie() {
    this.movieMessage.set('');
    this.movieError.set('');

    if (!this.posterFile) { this.movieError.set('กรุณาเลือกโปสเตอร์หนัง'); return; }

    const form = new FormData();
    form.append('title', this.movieForm.title);
    form.append('plot', this.movieForm.plot);
    form.append('price', String(this.movieForm.price ?? 0));
    form.append('duration', [
      this.movieForm.durationHours,
      this.movieForm.durationMinutes,
      this.movieForm.durationSeconds,
    ].map(v => String(v).padStart(2, '0')).join(':'));
    form.append('category', this.movieForm.category ?? '');
    form.append('poster', this.posterFile);

    this.http.post<Movie>(this.moviesUrl, form, { headers: this.headers }).subscribe({
      next: (movie) => {
        this.movies.update((list) => [...list, movie]);
        this.resetMovieForm();
      },
      error: (err) => this.movieError.set(err.error?.error ?? err.error?.message ?? 'เกิดข้อผิดพลาด'),
    });
  }

  private resetMovieForm() {
    this.movieMessage.set('เพิ่มหนังสำเร็จ');
    this.movieForm = { title: '', plot: '', price: null, durationHours: 0, durationMinutes: 0, durationSeconds: 0, category: null };
    this.posterFile = null;
    this.posterPreviewUrl.set('');
  }

  // ── Manage Showtimes methods ──
  onManageTabOpen() {
    this.manageMessage.set('');
    this.manageError.set('');
    this.showtimeListLoading.set(true);
    this.showtimeService.getAll(this.auth.getToken()!).subscribe({
      next: (data) => {
        this.allShowtimes.set(data);
        this.showtimeListLoading.set(false);
      },
      error: () => {
        this.manageError.set('ไม่สามารถโหลดรอบฉายได้');
        this.showtimeListLoading.set(false);
      },
    });
  }

  toggleExpand(id: string) {
    if (this.expandedId() === id) {
      this.expandedId.set(null);
      return;
    }
    this.expandedId.set(id);
    if (this.seatCache().has(id)) return;
    this.seatsLoadingId.set(id);
    this.seatService.getByShowtimeId(id).subscribe({
      next: (seats) => {
        this.seatCache.update((m) => new Map(m).set(id, seats));
        this.seatsLoadingId.set(null);
      },
      error: () => this.seatsLoadingId.set(null),
    });
  }

  seatsForShowtime(id: string): Seat[] {
    return this.seatCache().get(id) ?? [];
  }

  seatRows(id: string): { row: string; seats: Seat[] }[] {
    const grouped = new Map<string, Seat[]>();
    for (const seat of this.seatsForShowtime(id)) {
      const row = seat.seatCode.charAt(0);
      if (!grouped.has(row)) grouped.set(row, []);
      grouped.get(row)!.push(seat);
    }
    return [...grouped.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([row, seats]) => ({
        row,
        seats: seats.sort((a, b) => +a.seatCode.slice(1) - +b.seatCode.slice(1)),
      }));
  }

  seatStats(id: string) {
    const seats = this.seatsForShowtime(id);
    const vip = seats.filter((s) => s.type === SeatType.VIP);
    const normal = seats.filter((s) => s.type === SeatType.Normal);
    return {
      vipTotal: vip.length,
      vipBooked: vip.filter((s) => s.status === SeatStatus.Booked).length,
      normalTotal: normal.length,
      normalBooked: normal.filter((s) => s.status === SeatStatus.Booked).length,
    };
  }

  askDeleteShowtime(id: string) {
    this.deleteConfirmId.set(id);
  }

  cancelDeleteShowtime() {
    this.deleteConfirmId.set(null);
  }

  confirmDeleteShowtime(id: string) {
    this.deleteLoading.set(true);
    this.manageMessage.set('');
    this.manageError.set('');
    this.http.delete(`${this.showtimesUrl}/${id}`, { headers: this.headers }).subscribe({
      next: () => {
        this.allShowtimes.update((list) => list.filter((s) => s.id !== id));
        this.seatCache.update((m) => { const n = new Map(m); n.delete(id); return n; });
        if (this.expandedId() === id) this.expandedId.set(null);
        this.deleteConfirmId.set(null);
        this.deleteLoading.set(false);
        this.manageMessage.set('ลบรอบฉายสำเร็จ');
      },
      error: (err) => {
        this.manageError.set(err.error?.error ?? 'ไม่สามารถลบรอบฉายได้');
        this.deleteConfirmId.set(null);
        this.deleteLoading.set(false);
      },
    });
  }

  // ── Showtime methods ──
  submitShowtime() {
    this.showtimeMessage.set('');
    this.showtimeError.set('');

    const body = {
      movieId: this.showtimeForm.movieId,
      screenId: this.showtimeForm.screenId,
      startTime: this.showtimeForm.startTime,
    };

    this.http.post(this.showtimesUrl, body, { headers: this.headers }).subscribe({
      next: () => {
        this.showtimeMessage.set('เพิ่มรอบฉายสำเร็จ');
        this.showtimeForm = { movieId: null, screenId: '', startTime: '' };
        this.selectedShowtimeMovie.set(null);
      },
      error: (err) => this.showtimeError.set(err.error?.error ?? err.error?.message ?? 'เกิดข้อผิดพลาด'),
    });
  }
}
