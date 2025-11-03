import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  message = ''; // to show error or success messages

  constructor(private http: HttpClient, private router: Router) {}

  onLogin() {
    this.message = ''; // clear previous message

    if (!this.email || !this.password) {
      this.message = 'Email and password are required';
      return;
    }

    const payload = { email: this.email, password: this.password };

    this.http.post(`${environment.apiBaseUrl}/login`, payload).subscribe({
      next: (res: any) => {
        this.message = res.message || 'Login successful';
        localStorage.setItem('user', JSON.stringify(res)); // store user info
        this.router.navigate(['/home']); // redirect after success
      },
      error: (err) => {
        if (err.status === 401) {
          // backend sends 401 for invalid credentials
          this.message = 'Invalid email or password';
        } else {
          this.message = 'Server error. Please try again later.';
        }
      },
    });
  }

  onRegister() {
    this.router.navigate(['/register']);
  }
}