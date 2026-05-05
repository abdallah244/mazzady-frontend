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

    let processedPath = path;

    // Proactively fix legacy hardcoded localhost URLs if they exist in the DB
    if (processedPath.includes('localhost:3000')) {
      processedPath = processedPath.replace(/https?:\/\/localhost:3000/g, '');
    }

    // If it's already a full external URL, return as is
    if (processedPath.startsWith('http://') || processedPath.startsWith('https://')) {
      return processedPath;
    }

    // Ensure path starts with /
    const normalizedPath = processedPath.startsWith('/') ? processedPath : `/${processedPath}`;
    return `${environment.apiUrl}${normalizedPath}`;
  }
}
