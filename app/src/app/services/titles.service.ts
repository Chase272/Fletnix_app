import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TitlesService {
  private apiUrl = `${environment.apiBaseUrl}/titles`;

  constructor(private http: HttpClient) {}

  getAllTitles(age:number,page = 1, limit:number = 15, type: string = 'all'): Observable<{
  total: number;
  page: number;
  limit: number;
  data: any[];
  }> {
  const params = new HttpParams()
    .set('age', age)
    .set('type', type)
    .set('page', page)
    .set('limit', limit);

  return this.http.get<{ total: number; page: number; limit: number; data: any[] }>(
    `${this.apiUrl}`,
    { params }
  );
}


  searchTitles(query: string,age:number): Observable<any> {
    const params = new HttpParams().set('q', query).set('age', age);
    return this.http.get(`${environment.apiBaseUrl}/title/search`, { params });
  }

  getWatchlist(email: string): Observable<any> {
    const params = new HttpParams().set('email', email);
    return this.http.get(`${this.apiUrl}/watchlist`, { params });
  }
}
