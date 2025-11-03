import { environment } from './../../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css'
})
export class DetailsComponent implements OnInit {
  show: any;
  loading = true;
  error = false;
  formattedDate = '—';
  watchlist: any[] = [];
  userEmail = '';
  
  private apiUrl = `${environment.apiBaseUrl}/titles`;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.loadUser();
    this.loadWatchlist();
    this.loadShow(id);
  }

  private loadUser() {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const user = JSON.parse(stored);
        this.userEmail = user.email;
      }
    } catch (err) {
      console.error('Error reading user data', err);
    }
  }

  loadShow(id: string | null) {
    if (!id) return;
    this.loading = true;
    this.http.get(`${this.apiUrl}/details/${id}`).subscribe({
      next: (data) => {
        this.show = data;
        this.loading = false;

        if (this.show.date_added) {
          const date = new Date(this.show.date_added);
          this.formattedDate = isNaN(date.getTime())
            ? this.show.date_added
            : date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.detail || 'Error fetching details';
      },
    });
  }

  loadWatchlist() {
    if (!this.userEmail) return;

    this.http.get<any>(`${this.apiUrl}/watchlist?email=${this.userEmail}`).subscribe({
      next: (res) => {
        this.watchlist = res?.shows || [];
      },
      error: (err) => {
        console.error('Failed to load watchlist', err);
        this.watchlist = [];
      },
    });
  }

  isInWatchlist(show: any): boolean {
    if (!show || !this.watchlist) return false;
    return this.watchlist.some((item: any) => item.show_id === show.show_id);
  }

  toggleWatchlist(show: any) {
    if (!this.userEmail || !show?.show_id) return;

    const isAdded = this.isInWatchlist(show);

    if (isAdded) {
      // DELETE request
      this.http
        .delete(`${this.apiUrl}/watchlist?email=${this.userEmail}&show_id=${show.show_id}`)
        .subscribe({
          next: () => {
            this.watchlist = this.watchlist.filter((item) => item.show_id !== show.show_id);
          },
          error: (err) => console.error('Failed to remove from watchlist', err),
        });
    } else {
      // POST request
      this.http
        .post(`${this.apiUrl}/watchlist?email=${this.userEmail}&show_id=${show.show_id}`, {})
        .subscribe({
          next: () => {
            this.watchlist.push(show);
          },
          error: (err) => console.error('Failed to add to watchlist', err),
        });
    }
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
