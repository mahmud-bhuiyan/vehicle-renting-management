import { Injectable, computed, signal } from '@angular/core';

const AUTH_STORAGE_KEY = 'vehicle-rental-auth';
const VALID_USERNAME = 'admin';
const VALID_PASSWORD = 'admin123';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly loggedIn = signal(this.readStorage());

  readonly isLoggedIn = computed(() => this.loggedIn());

  login(username: string, password: string): boolean {
    const isValid = username === VALID_USERNAME && password === VALID_PASSWORD;

    if (!isValid) {
      return false;
    }

    sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
    this.loggedIn.set(true);
    return true;
  }

  logout(): void {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    this.loggedIn.set(false);
  }

  private readStorage(): boolean {
    return sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true';
  }
}
