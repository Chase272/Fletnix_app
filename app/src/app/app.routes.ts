import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { AuthGuard } from './auth.guard';
import { DetailsComponent } from './pages/details/details.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
    {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
  },
  { path: 'details/:id', component: DetailsComponent , canActivate: [AuthGuard],},
  { path: '**', redirectTo: 'login' },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
