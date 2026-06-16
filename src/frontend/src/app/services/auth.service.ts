import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginDto, AuthResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private readonly TOKEN_KEY = 'taller_token';
  private readonly USER_KEY = 'taller_user';

  private _currentUser = signal<AuthResponse | null>(null);
  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn = computed(() => !!this._currentUser());
  readonly userRole = computed(() => this._currentUser()?.rol ?? '');
  readonly isAdmin = computed(() => this._currentUser()?.rol === 'Admin');

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  login(dto: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, dto)
      .pipe(tap(res => this.setSession(res)));
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private setSession(res: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(res));
    this._currentUser.set(res);
  }

  private loadUserFromStorage(): void {
    const stored = localStorage.getItem(this.USER_KEY);
    if (stored) {
      this._currentUser.set(JSON.parse(stored));
    }
  }
}
