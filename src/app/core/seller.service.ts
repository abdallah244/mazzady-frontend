import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface SellerStats {
  sellerId: string;
  likesCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class SellerService {
  private http = inject(HttpClient);

  // Event stream for updates
  private sellerUpdateSubject = new Subject<SellerStats>();
  sellerUpdates$ = this.sellerUpdateSubject.asObservable();

  getSellerStats(sellerId: string) {
    return this.http.get<{ count: number }>(`${environment.apiUrl}/seller-likes/${sellerId}/count`);
  }

  checkIfLiked(sellerId: string, userId: string) {
    return this.http.get<{ isLiked: boolean }>(
      `${environment.apiUrl}/seller-likes/${sellerId}/user/${userId}`,
    );
  }

  toggleLike(sellerId: string, userId: string) {
    return this.http
      .post<{ liked: boolean; count: number }>(`${environment.apiUrl}/seller-likes`, {
        sellerId,
        userId,
      })
      .pipe(
        tap((res) => {
          // Broadcast update
          this.sellerUpdateSubject.next({
            sellerId,
            likesCount: res.count,
          });
        }),
      );
  }

  getAllSellersStats() {
    return this.http.get<any[]>(`${environment.apiUrl}/seller-likes/sellers/stats`);
  }
}
