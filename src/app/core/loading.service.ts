import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private progressSubject = new BehaviorSubject<number>(0);
  public progress$ = this.progressSubject.asObservable();

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  private progress = signal(0);
  private isLoading = signal(false);

  startLoading() {
    this.isLoading.set(true);
    this.isLoadingSubject.next(true);
    this.progress.set(0);
    this.progressSubject.next(0);
  }

  stopLoading() {
    this.stopProgressSimulation();
    this.completeProgress();
    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.isLoading.set(false);
      this.isLoadingSubject.next(false);
      this.progress.set(0);
      this.progressSubject.next(0);
    }, 100);
  }

  setProgress(value: number) {
    const clampedValue = Math.min(100, Math.max(0, value));
    this.progress.set(clampedValue);
    this.progressSubject.next(clampedValue);
  }

  incrementProgress(amount: number = 10) {
    const current = this.progress();
    const newValue = Math.min(100, current + amount);
    this.setProgress(newValue);
  }

  completeProgress() {
    this.setProgress(100);
  }

  private progressInterval: any = null;

  simulateProgress() {
    // Clear any existing interval
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }

    this.startLoading();
    let current = 0;
    this.progressInterval = setInterval(() => {
      // Faster progress at the beginning, slower near the end
      const increment = current < 70 
        ? Math.random() * 25 + 15  // Fast: 15-40%
        : Math.random() * 8 + 3;   // Slow: 3-11%
      
      current += increment;
      if (current >= 95) {
        current = 95;
        if (this.progressInterval) {
          clearInterval(this.progressInterval);
          this.progressInterval = null;
        }
      }
      this.setProgress(current);
    }, 50); // Faster interval: 50ms instead of 80ms
  }

  stopProgressSimulation() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  getProgress(): number {
    return this.progress();
  }

  getIsLoading(): boolean {
    return this.isLoading();
  }
}

