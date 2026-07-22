import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { AuthResponse, CurrentUser, LoginRequest, RegisterRequest } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/auth';

  private currentUserSig = signal<CurrentUser | null>(this.loadUser());

  readonly currentUser = this.currentUserSig.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSig() !== null);

  register(body: RegisterRequest) {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, body)
      .pipe(tap(res => this.persist(res)));
  }

  login(body: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, body)
      .pipe(tap(res => this.persist(res)));
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSig.set(null);
  }

  private persist(res: AuthResponse): void {
      localStorage.setItem('token', res.token)
      localStorage.setItem('user', JSON.stringify({ email: res.email, username: res.username }));
      this.currentUserSig.set({ email: res.email, username: res.username });
  }

  private loadUser(): CurrentUser | null {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as CurrentUser) : null;
  }
}
