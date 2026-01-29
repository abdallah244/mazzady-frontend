import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Pipe to transform relative asset paths to full API URLs
 * Usage: {{ imagePath | assetUrl }}
 */
@Pipe({
  name: 'assetUrl',
  standalone: true,
})
export class AssetUrlPipe implements PipeTransform {
  transform(path: string | null | undefined): string | null {
    if (!path) return null;

    // If it's already a full URL, return as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${environment.apiUrl}${normalizedPath}`;
  }
}
