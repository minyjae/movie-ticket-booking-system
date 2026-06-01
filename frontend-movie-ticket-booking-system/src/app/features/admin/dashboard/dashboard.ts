import { Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../auth/services/auth.service';
import { MovieService } from '../../movie/services/movie.service';
import { ShowtimeService } from '../../movie/services/showtime.service';
import { SeatService } from '../../booking/services/seat.service';
import { BannerService } from '../../banner/services/banner.service';
import { ScreenService } from '../services/screen.service';
import { MovieCategory, Movie } from '../../movie/models/movie.model';
import { Showtime } from '../../movie/models/showtime.model';
import { Seat, SeatStatus, SeatType } from '../../booking/models/seat.model';
import { Banner } from '../../banner/models/banner.model';
import { Screen } from '../models/screen.model';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-admin-dashboard',
  imports: [FormsModule, NgSelectModule, DatePipe, DecimalPipe],
  templateUrl: './dashboard.html',
})
export class AdminDashboard {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private movieService = inject(MovieService);
  private showtimeService = inject(ShowtimeService);
  private seatService = inject(SeatService);
  private bannerService = inject(BannerService);
  private screenService = inject(ScreenService);

  private readonly moviesUrl = 'http://localhost:5074/api/movies';
  private readonly showtimesUrl = 'http://localhost:5074/api/showtimes';

  movies = signal<Movie[]>([]);
  categories = Object.values(MovieCategory);

  constructor() {
    this.movieService.getAll().subscribe({ next: (data) => this.movies.set(data) });
    this.screenService.getAll().subscribe({ next: (data) => this.screens.set(data) });
  }

  activeTab = signal<'banner' | 'movie' | 'showtime' | 'manage' | 'screens' | 'movies'>('movie');

  SeatStatus = SeatStatus;
  SeatType = SeatType;

  // ── Movie form ──
  movieForm = { title: '', plot: '', price: null as number | null, durationHours: 0, durationMinutes: 0, durationSeconds: 0, category: null as MovieCategory | null };
  movieMessage = signal('');
  movieError = signal('');
  posterFile: File | null = null;
  posterPreviewUrl = signal('');

  // ── Showtime form ──
  showtimeForm = { movieId: null as string | null, screenId: null as string | null, startTime: '' };
  showtimeMessage = signal('');
  showtimeError = signal('');
  selectedShowtimeMovie = signal<Movie | null>(null);
  selectedShowtimeScreen = signal<Screen | null>(null);

  onShowtimeMovieChange(movieId: string | null) {
    this.selectedShowtimeMovie.set(this.movies().find((m) => m.id === movieId) ?? null);
  }

  onShowtimeScreenChange(screenId: string | null) {
    this.selectedShowtimeScreen.set(this.screens().find((s) => s.id === screenId) ?? null);
  }

  // ── Screens tab ──
  screens = signal<Screen[]>([]);
  screensLoading = signal(false);
  screenForm = { name: '', vipRows: 2, vipSeatsPerRow: 8, normalRows: 6, normalSeatsPerRow: 12 };
  screenMessage = signal('');
  screenError = signal('');
  screenDeleteConfirmId = signal<string | null>(null);
  screenDeleteLoading = signal(false);

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

  // ── Movie List/Edit tab ──
  editingMovie = signal<Movie | null>(null);
  editMovieForm = {
    title: '', plot: '', price: null as number | null,
    durationHours: 0, durationMinutes: 0, durationSeconds: 0,
    category: null as MovieCategory | null,
  };
  movieListMessage = signal('');
  movieListError   = signal('');
  movieDeleteConfirmId = signal<string | null>(null);
  movieDeleteLoading   = signal(false);
  editPosterFile: File | null = null;
  editPosterPreviewUrl = signal('');
  editPosterLoading = signal(false);

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

  // ── Movie List/Edit methods ──
  private parseDuration(d: string): { h: number; m: number; s: number } {
    const parts = (d ?? '00:00:00').split(':').map(Number);
    return { h: parts[0] || 0, m: parts[1] || 0, s: parts[2] || 0 };
  }

  startEditMovie(movie: Movie) {
    const dur = this.parseDuration(movie.duration as unknown as string);
    this.editMovieForm = {
      title: movie.title,
      plot: movie.plot,
      price: movie.price,
      durationHours: dur.h,
      durationMinutes: dur.m,
      durationSeconds: dur.s,
      category: movie.category,
    };
    this.editPosterFile = null;
    this.editPosterPreviewUrl.set('');
    this.movieListMessage.set('');
    this.movieListError.set('');
    this.editingMovie.set(movie);
  }

  cancelEditMovie() {
    this.editingMovie.set(null);
  }

  saveEditMovie() {
    const movie = this.editingMovie();
    if (!movie) return;
    this.movieListMessage.set('');
    this.movieListError.set('');

    const body = {
      id: movie.id,
      title: this.editMovieForm.title || undefined,
      plot: this.editMovieForm.plot || undefined,
      price: this.editMovieForm.price ?? undefined,
      duration: [
        this.editMovieForm.durationHours,
        this.editMovieForm.durationMinutes,
        this.editMovieForm.durationSeconds,
      ].map((v) => String(v).padStart(2, '0')).join(':') || undefined,
      category: this.editMovieForm.category ?? undefined,
    };

    this.http.put<Movie>(`${this.moviesUrl}`, body, { headers: this.headers }).subscribe({
      next: (updated) => {
        this.movies.update((list) => list.map((m) => (m.id === updated.id ? updated : m)));
        this.editingMovie.set(updated);
        this.movieListMessage.set('บันทึกข้อมูลสำเร็จ');
      },
      error: (err) => this.movieListError.set(err.error?.error ?? 'เกิดข้อผิดพลาด'),
    });
  }

  onEditPosterSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.editPosterFile = file;
    this.editPosterPreviewUrl.set(URL.createObjectURL(file));
    this.uploadEditPoster();
  }

  uploadEditPoster() {
    const movie = this.editingMovie();
    if (!movie || !this.editPosterFile) return;
    this.editPosterLoading.set(true);
    const form = new FormData();
    form.append('file', this.editPosterFile);
    this.http.post<Movie>(`${this.moviesUrl}/${movie.id}/poster`, form, { headers: this.headers }).subscribe({
      next: (updated) => {
        this.movies.update((list) => list.map((m) => (m.id === updated.id ? updated : m)));
        this.editingMovie.set(updated);
        this.editPosterLoading.set(false);
        this.movieListMessage.set('อัปโหลดโปสเตอร์สำเร็จ');
      },
      error: () => {
        this.movieListError.set('อัปโหลดโปสเตอร์ไม่สำเร็จ');
        this.editPosterLoading.set(false);
      },
    });
  }

  askDeleteMovie(id: string) {
    this.movieDeleteConfirmId.set(id);
  }

  cancelDeleteMovie() {
    this.movieDeleteConfirmId.set(null);
  }

  confirmDeleteMovie(id: string) {
    this.movieDeleteLoading.set(true);
    this.movieListMessage.set('');
    this.movieListError.set('');
    this.http.delete(`${this.moviesUrl}/${id}`, { headers: this.headers }).subscribe({
      next: () => {
        this.movies.update((list) => list.filter((m) => m.id !== id));
        if (this.editingMovie()?.id === id) this.editingMovie.set(null);
        this.movieDeleteConfirmId.set(null);
        this.movieDeleteLoading.set(false);
        this.movieListMessage.set('ลบหนังสำเร็จ');
      },
      error: (err) => {
        this.movieListError.set(err.error?.error ?? 'ไม่สามารถลบหนังได้');
        this.movieDeleteConfirmId.set(null);
        this.movieDeleteLoading.set(false);
      },
    });
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

  // ── Screen methods ──
  onScreensTabOpen() {
    this.screenMessage.set('');
    this.screenError.set('');
    this.screensLoading.set(true);
    this.screenService.getAll().subscribe({
      next: (data) => { this.screens.set(data); this.screensLoading.set(false); },
      error: () => { this.screenError.set('ไม่สามารถโหลดข้อมูลโรงได้'); this.screensLoading.set(false); },
    });
  }

  submitScreen() {
    this.screenMessage.set('');
    this.screenError.set('');
    const f = this.screenForm;
    if (!f.name.trim()) { this.screenError.set('กรุณากรอกชื่อโรง'); return; }
    if (f.normalRows < 1) { this.screenError.set('ต้องมีแถวปกติอย่างน้อย 1 แถว'); return; }

    this.screenService.create({
      name: f.name.trim(),
      vipRows: f.vipRows,
      vipSeatsPerRow: f.vipSeatsPerRow,
      normalRows: f.normalRows,
      normalSeatsPerRow: f.normalSeatsPerRow,
    }).subscribe({
      next: (screen) => {
        this.screens.update((list) => [...list, screen].sort((a, b) => a.name.localeCompare(b.name)));
        this.screenForm = { name: '', vipRows: 2, vipSeatsPerRow: 8, normalRows: 6, normalSeatsPerRow: 12 };
        this.screenMessage.set(`เพิ่มโรง "${screen.name}" สำเร็จ`);
      },
      error: (err) => this.screenError.set(
        (Array.isArray(err.error) ? err.error.join(', ') : null)
          ?? err.error?.error ?? 'เกิดข้อผิดพลาด'
      ),
    });
  }

  askDeleteScreen(id: string) { this.screenDeleteConfirmId.set(id); }
  cancelDeleteScreen() { this.screenDeleteConfirmId.set(null); }

  confirmDeleteScreen(id: string) {
    this.screenDeleteLoading.set(true);
    this.screenMessage.set('');
    this.screenError.set('');
    this.screenService.delete(id).subscribe({
      next: () => {
        this.screens.update((list) => list.filter((s) => s.id !== id));
        this.screenDeleteConfirmId.set(null);
        this.screenDeleteLoading.set(false);
        this.screenMessage.set('ลบโรงสำเร็จ');
      },
      error: (err) => {
        this.screenError.set(err.error?.error ?? 'ไม่สามารถลบโรงได้ อาจมีรอบฉายผูกอยู่');
        this.screenDeleteConfirmId.set(null);
        this.screenDeleteLoading.set(false);
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
        this.showtimeForm = { movieId: null, screenId: null, startTime: '' };
        this.selectedShowtimeMovie.set(null);
        this.selectedShowtimeScreen.set(null);
      },
      error: (err) => this.showtimeError.set(err.error?.error ?? err.error?.message ?? 'เกิดข้อผิดพลาด'),
    });
  }
}
