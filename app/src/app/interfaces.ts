export interface Show {
  show_id: string;
  title: string;
  type?: string;
  description?: string;
  release_date?: string;
  rating?: number;
  age_rating?: string;
  date_added?: string;
  [key: string]: any;
}


export interface User {
  email: string;
  age: number;
  watchlist: Show[];
}