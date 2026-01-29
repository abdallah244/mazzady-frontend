import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

/**
 * Central API configuration service
 * Use this service to get API URLs instead of hardcoding them
 */
@Injectable({
  providedIn: 'root',
})
export class ApiConfigService {
  private readonly apiUrl = environment.apiUrl;
  private readonly frontendUrl = environment.frontendUrl;
  private readonly wsUrl = environment.wsUrl;

  /**
   * Get the base API URL
   */
  getApiUrl(): string {
    return this.apiUrl;
  }

  /**
   * Get the frontend URL
   */
  getFrontendUrl(): string {
    return this.frontendUrl;
  }

  /**
   * Get the WebSocket URL
   */
  getWsUrl(): string {
    return this.wsUrl;
  }

  /**
   * Build a full API endpoint URL
   * @param endpoint - The endpoint path (e.g., '/auth/login')
   */
  buildApiUrl(endpoint: string): string {
    // Ensure endpoint starts with /
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.apiUrl}${normalizedEndpoint}`;
  }

  /**
   * Build a full asset URL (for images, files, etc.)
   * @param path - The asset path (e.g., '/uploads/images/avatar.jpg')
   */
  buildAssetUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    // If it's already a full URL, return as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.apiUrl}${normalizedPath}`;
  }

  /**
   * Check if we're in production mode
   */
  isProduction(): boolean {
    return environment.production;
  }

  /**
   * Check if debug mode is enabled
   */
  isDebugMode(): boolean {
    return environment.enableDebugMode;
  }

  /**
   * Check if console logging is enabled
   */
  isConsoleLogEnabled(): boolean {
    return environment.enableConsoleLog;
  }
}
