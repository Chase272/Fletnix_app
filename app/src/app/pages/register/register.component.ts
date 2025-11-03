import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'], 
})
export class RegisterComponent {
  email = '';
  password = '';
  age: number | null = null;
  message = '';

  constructor(private http: HttpClient, private router: Router) {}

  onRegister() {

    const missing = !this.email ? 'Email' : !this.password ? 'Password' : !this.age ? 'Age' : null;
    if (missing) {
      this.message = `${missing} is required`;
      return;
    }
    const payload = {
      email: this.email,
      password: this.password,
      age: this.age,
    };

    this.http.post(`${environment.apiBaseUrl}/register`, payload).subscribe({
      next: (res) => {
        console.log('Registered:', res);
        this.message = 'Registration successful. Redirecting...';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        console.error('Error:', err);
        this.message =
          err.error?.detail || 'Registration failed. Try again later.';
      },
    });
  }

  goToLogin() {
  this.router.navigate(['/login']);
}
}
