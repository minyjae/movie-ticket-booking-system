import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../environments/environment';
import { toSignal } from '@angular/core/rxjs-interop';
import { MovieService } from '../../app/features/movie/services/movie.service';
import { Movie as MovieModel, MovieCategory } from '../../app/features/movie/models/movie.model';

interface CategoryGroup {
  category: string;
  movies: MovieModel[];
}

@Component({
  selector: 'app-movie',
  imports: [RouterLink],
  templateUrl: './movie.html',
  styleUrl: './movie.css',
})
export class Movie {
  readonly apiUrl = environment.apiUrl;
  private router = inject(Router);
  private movieService = inject(MovieService);

  allMovies = toSignal(this.movieService.getAll(), { initialValue: [] });
  searchQuery = signal('');

  selectedCategory = signal<MovieCategory | null>(null);

  filteredMovies = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const category = this.selectedCategory();

    return this.allMovies().filter(m => {
      const matchesQuery = !query || m.title.toLowerCase().includes(query);
      const matchesCategory = !category || m.category === category;
      return matchesCategory && matchesQuery;
    })
  }) 

  moviesByCategory = computed<CategoryGroup[]>(() => {
    const grouped = new Map<string, MovieModel[]>();
    for (const movie of this.filteredMovies()) {
      if (!grouped.has(movie.category)) grouped.set(movie.category, []);
      grouped.get(movie.category)!.push(movie);
    }
    return [...grouped.entries()].map(([category, movies]) => ({ category, movies }));
  });

  isFiltering = computed(() =>
    this.searchQuery().trim() !== '' || this.selectedCategory() !== null
  );

  availableCategories = computed(() => {
    const cats = new Set(this.allMovies().map(m => m.category));
    return Object.values(MovieCategory).filter(c => cats.has(c));
  });

  categoryLabel(cat: string): string {
    return cat.replace(/_/g, ' ');
  }

  onSearch(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  selectCategory(cat: MovieCategory) {
    this.selectedCategory.set(this.selectedCategory() === cat ? null : cat);
  }

  clearFilters() {
    this.searchQuery.set('');
    this.selectedCategory.set(null);
  }

  // per-strip drag state
  private dragEl: HTMLElement | null = null;
  private dragStartX = 0;
  private scrollStartLeft = 0;
  private isDragging = false;
  private hasDragged = false;

  startDrag(e: MouseEvent, el: HTMLElement) {
    this.dragEl = el;
    this.isDragging = true;
    this.hasDragged = false;
    this.dragStartX = e.clientX;
    this.scrollStartLeft = el.scrollLeft;
  }

  onDrag(e: MouseEvent) {
    if (!this.isDragging || !this.dragEl) return;
    const diff = e.clientX - this.dragStartX;
    if (Math.abs(diff) > 5) this.hasDragged = true;
    e.preventDefault();
    this.dragEl.scrollLeft = this.scrollStartLeft - diff;
  }

  endDrag() {
    this.isDragging = false;
    this.dragEl = null;
  }

  onMovieClick(id: string) {
    if (this.hasDragged) return;
    this.router.navigate(['/movies', id]);
  }
}
