import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  email: string;
  firstName: string;
  middleName: string;
  lastName: string;
  nickname: string;
  phone: string;
  profileImageUrl?: string;
  isProfileComplete?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  message: string;
  userId: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private readonly ACCESS_TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly REMEMBER_ME_KEY = 'rememberMe';
  private readonly USER_KEY = 'user';

  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  register(formData: FormData): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, formData);
  }

  login(email: string, password: string, rememberMe: boolean = false): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, {
        email,
        password,
        rememberMe,
      })
      .pipe(
        tap((response) => {
          // Store tokens
          this.setTokens(response.accessToken, response.refreshToken, rememberMe);
          // Store user
          this.setUser(response.user, rememberMe);
        }),
      );
  }

  // Get access token for API requests
  getAccessToken(): string | null {
    return (
      localStorage.getItem(this.ACCESS_TOKEN_KEY) || sessionStorage.getItem(this.ACCESS_TOKEN_KEY)
    );
  }

  // Get refresh token
  getRefreshToken(): string | null {
    return (
      localStorage.getItem(this.REFRESH_TOKEN_KEY) || sessionStorage.getItem(this.REFRESH_TOKEN_KEY)
    );
  }

  // Store tokens
  private setTokens(accessToken: string, refreshToken: string, rememberMe: boolean): void {
    if (rememberMe) {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    } else {
      sessionStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
      sessionStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  // Refresh access token
  refreshAccessToken(): Observable<{ accessToken: string }> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http
      .post<{ accessToken: string }>(`${this.apiUrl}/refresh-token`, {
        refreshToken,
      })
      .pipe(
        tap((response) => {
          // Update access token
          const rememberMe = localStorage.getItem(this.REMEMBER_ME_KEY) === 'true';
          if (rememberMe) {
            localStorage.setItem(this.ACCESS_TOKEN_KEY, response.accessToken);
          } else {
            sessionStorage.setItem(this.ACCESS_TOKEN_KEY, response.accessToken);
          }
        }),
      );
  }

  checkUserExists(email: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${this.apiUrl}/check-user`, {
      params: { email },
    });
  }

  checkNicknameExists(nickname: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${this.apiUrl}/check-nickname`, {
      params: { nickname },
    });
  }

  checkPhoneExists(phone: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${this.apiUrl}/check-phone`, {
      params: { phone },
    });
  }

  checkNationalIdExists(nationalId: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${this.apiUrl}/check-national-id`, {
      params: { nationalId },
    });
  }

  sendVerificationCode(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/send-verification-code`, {
      email,
      forLogin: false,
    });
  }

  sendVerificationCodeForLogin(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/send-verification-code`, {
      email,
      forLogin: true,
    });
  }

  verifyEmailCode(email: string, code: string): Observable<{ message: string; verified: boolean }> {
    return this.http.post<{ message: string; verified: boolean }>(
      `${this.apiUrl}/verify-email-code`,
      {
        email,
        code,
      },
    );
  }

  verifyOAuthCode(
    email: string,
    code: string,
    provider: 'google' | 'facebook',
    userInfo: any,
  ): Observable<{ message: string; user: User }> {
    return this.http.post<{ message: string; user: User }>(`${this.apiUrl}/verify-oauth-code`, {
      email,
      code,
      provider,
      userInfo,
    });
  }

  setUser(user: User, rememberMe: boolean = false): void {
    this.currentUser.set(user);
    if (rememberMe) {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 7); // 7 days
      localStorage.setItem(this.REMEMBER_ME_KEY, 'true');
      localStorage.setItem('rememberMeExpiry', expirationDate.toISOString());
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } else {
      sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  logout(): void {
    const user = this.currentUser();
    if (user) {
      // Call backend to update user status
      this.http.post(`${this.apiUrl}/logout`, { userId: user.id }).subscribe({
        next: () => {
          console.log('User logged out successfully');
        },
        error: (error) => {
          console.error('Error during logout:', error);
        },
      });
    }
    this.currentUser.set(null);
    // Clear all auth data
    localStorage.removeItem(this.REMEMBER_ME_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem('rememberMeExpiry');
    sessionStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  private loadUserFromStorage(): void {
    // Check if we have a valid token
    const token = this.getAccessToken();
    if (!token) {
      this.clearAllStorage();
      return;
    }

    // Check if token is expired (basic check - JWT expiry)
    if (this.isTokenExpired(token)) {
      // Try to refresh
      const refreshToken = this.getRefreshToken();
      if (refreshToken && !this.isTokenExpired(refreshToken)) {
        // Will be refreshed on next API call
      } else {
        this.clearAllStorage();
        return;
      }
    }

    const rememberMe = localStorage.getItem(this.REMEMBER_ME_KEY);

    if (rememberMe) {
      // Check if Remember Me has expired (7 days)
      const expiryStr = localStorage.getItem('rememberMeExpiry');
      if (expiryStr) {
        const expiryDate = new Date(expiryStr);
        if (new Date() > expiryDate) {
          // Expired, clear storage
          this.logout();
          return;
        }
      }

      const userStr = localStorage.getItem(this.USER_KEY);
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          this.currentUser.set(user);
        } catch (e) {
          console.error('Error loading user from storage:', e);
        }
      }
    } else {
      const userStr = sessionStorage.getItem(this.USER_KEY);
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          this.currentUser.set(user);
        } catch (e) {
          console.error('Error loading user from storage:', e);
        }
      }
    }
  }

  // Check if JWT token is expired
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= exp;
    } catch {
      return true;
    }
  }

  // Clear all storage
  private clearAllStorage(): void {
    localStorage.removeItem(this.REMEMBER_ME_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem('rememberMeExpiry');
    sessionStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    // Check if token is expired
    if (this.isTokenExpired(token)) {
      // Check if we have refresh token
      const refreshToken = this.getRefreshToken();
      if (refreshToken && !this.isTokenExpired(refreshToken)) {
        return true; // Will be refreshed on next API call
      }
      return false;
    }

    return this.currentUser() !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUser();
  }
}
