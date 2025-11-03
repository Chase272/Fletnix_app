import { TitlesService } from '../../services/titles.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Show,User } from '../../interfaces';





@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.component.html',
})


export class HomeComponent implements OnInit {
  shows: any[] = [];
  userAge = 0;
  error: string | null = null;
  searchTerm = '';
  selectedType = 'All';
  not_found = false;
  user: User = { email: '', age: 0,watchlist:[] }
  totalItems = 0;
  page = 1;
  limit = 15;
  totalPages = 0;
  loading = true;
  initial_letter = '';
  watchlist: Show[] = [];
  showingWatchlist = false 


  constructor(private router: Router, private titleService: TitlesService) {}

  ngOnInit(): void {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
         this.user = JSON.parse(stored);
        this.userAge = Number(this.user?.age) || 0;
        this.initial_letter = this.user?.email?.[0]?.toUpperCase() || '?';
      }
    } catch (err) {
      console.error('Error parsing user data:', err);
      this.userAge = 0;
    }


    this.loadShows();
    this.loadWatchlist();
  }

  loadShows(): void {
    this.loading = true;
    this.error = null;
    this.not_found = false;

    this.titleService
      .getAllTitles(this.userAge, this.page, this.limit, this.selectedType)
      .subscribe({
        next: (res) => {
          this.loading = false;
          if (!res || !res.data) {
            this.handleEmpty();
            return;
          }

          this.shows = res.data;
          this.totalItems = res.total || res.data.length;
          this.totalPages = Math.max(1, Math.ceil(this.totalItems / this.limit));
          this.not_found = this.shows.length === 0;
        },
        error: (err) => this.handleError(err, 'Failed to load shows'),
      });
  }

   private loadWatchlist(): void {
    if (!this.user.email) return;

    this.titleService.getWatchlist(this.user.email).subscribe({
      next: (res) => {
        if (res?.shows?.length) {
          this.watchlist = res.shows;
        } else {
          this.watchlist = [];
        }
      },
      error: (err) => {
        console.error('Failed to load watchlist', err);
        this.watchlist = [];
      },
    });
  }

  toggleWatchlistView(): void {
    if (this.showingWatchlist) {
      this.showingWatchlist = false;
      this.loadShows();
      return;
    }

    this.showingWatchlist = true;
    this.loading = true;
    this.error = null;
    this.not_found = false;

    this.titleService.getWatchlist(this.user.email).subscribe({
      next: (res) => {
        this.loading = false;
        if (!res?.shows?.length) {
          this.handleEmpty();
          this.error = 'Nothing in watchlist';
          return;
        }
        this.shows = res.shows;
        this.totalItems = res.shows.length;
        this.totalPages = 1;
        this.not_found = false;
      },
      error: (err) => this.handleError(err, 'Failed to load watchlist'),
    });
  }

  onSearch(): void {
  const query = this.searchTerm.trim().toLowerCase();

  // If watchlist mode → filter locally
  if (this.showingWatchlist) {
    if (!query) {
      this.shows = this.watchlist;
    } else {
      this.shows = this.watchlist.filter(item =>
        item.title?.toLowerCase().includes(query)
      );
    }

    this.totalItems = this.shows.length;
    this.totalPages = 1;
    this.not_found = this.shows.length === 0;
    return;
  }

  // Otherwise → normal search via API
  if (!query) {
    this.page = 1;
    this.loadShows();
    return;
  }

  this.loading = true;
  this.error = null;
  this.not_found = false;

  this.titleService.searchTitles(query, this.userAge).subscribe({
    next: (res) => {
      this.loading = false;
      if (!res?.results?.length) {
        this.handleEmpty();
        return;
      }
      this.shows = res.results;
      this.totalItems = res.count || res.results.length;
      this.totalPages = Math.max(1, Math.ceil(this.totalItems / this.limit));
      this.page = 1;
      this.not_found = false;
    },
    error: (err) => this.handleError(err, 'Search failed'),
  });
}

filterByType(type: string): void {
  this.selectedType = type;


  if (this.showingWatchlist) {
    if (type === 'All') {
      this.shows = this.watchlist;
    } else {
      this.shows = this.watchlist.filter(item =>
        item.type === type 
      );
    }

    this.totalItems = this.shows.length;
    this.totalPages = 1;
    this.not_found = this.shows.length === 0;
    return;
  }


  this.page = 1;
  this.loadShows();
}



  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadShows();
    }
  }

  previousPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadShows();
    }
  }

isInWatchlist(show: any): boolean {
  if (!Array.isArray(this.watchlist)) return false;
  for (const item of this.watchlist) {
    if (item.show_id === show.show_id) return true;
  }
  return false;
}



  logout(): void {
    this.router.navigate(['/login']);
  }

 

  private handleError(err: any, fallbackMsg: string): void {
    console.error(fallbackMsg, err);
    this.error =
      err?.error?.detail ||
      err?.message ||
      fallbackMsg ||
      'Unexpected error occurred';
    this.loading = false;
    this.not_found = false;
    this.shows = [];
  }

  private handleEmpty(): void {
    this.shows = [];
    this.totalItems = 0;
    this.totalPages = 0;
    this.not_found = true;
    this.loading = false;
  }
}
