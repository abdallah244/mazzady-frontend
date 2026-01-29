import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslationService } from '../../core/translation.service';
import { LoadingButtonDirective } from '../../shared/loading-button.directive';
import { environment } from '../../../environments/environment';

interface ImageItem {
  id: string;
  url: string;
  file?: File;
  isNew?: boolean;
}

@Component({
  selector: 'app-edit-home-page',
  imports: [CommonModule, LoadingButtonDirective],
  templateUrl: './edit-home-page.component.html',
  styleUrl: './edit-home-page.component.sass',
})
export class EditHomePageComponent {
  private translationService = inject(TranslationService);
  private router = inject(Router);
  private http = inject(HttpClient);

  isArabic = computed(() => this.translationService.isArabic());

  heroImages = signal<ImageItem[]>([]);
  howItWorksImages = signal<ImageItem[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  ngOnInit() {
    this.loadImages();
  }

  loadImages() {
    this.isLoading.set(true);

    // Load Hero images
    this.http
      .get<{ success: boolean; images: any[] }>(`${environment.apiUrl}/home/images/hero`)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.heroImages.set(
              response.images.map((img) => ({
                id: img.id,
                url: `${environment.apiUrl}${img.url}`,
                isNew: false,
              })),
            );
          }
        },
        error: (error) => {
          console.error('Error loading hero images:', error);
          if (error.status === 0) {
            this.error.set(
              this.isArabic()
                ? 'لا يمكن الاتصال بالخادم. تأكد من تشغيل الـ backend.'
                : 'Cannot connect to server. Make sure the backend is running.',
            );
          }
          this.isLoading.set(false);
        },
      });

    // Load How It Works images
    this.http
      .get<{ success: boolean; images: any[] }>(`${environment.apiUrl}/home/images/howItWorks`)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.howItWorksImages.set(
              response.images.map((img) => ({
                id: img.id,
                url: `${environment.apiUrl}${img.url}`,
                isNew: false,
              })),
            );
          }
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading howItWorks images:', error);
          if (error.status === 0 && !this.error()) {
            this.error.set(
              this.isArabic()
                ? 'لا يمكن الاتصال بالخادم. تأكد من تشغيل الـ backend.'
                : 'Cannot connect to server. Make sure the backend is running.',
            );
          }
          this.isLoading.set(false);
        },
      });
  }

  onFileSelected(event: Event, type: 'hero' | 'howItWorks') {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.error.set(this.isArabic() ? 'الملف المحدد ليس صورة' : 'Selected file is not an image');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.error.set(
          this.isArabic()
            ? 'حجم الصورة كبير جداً (الحد الأقصى 5MB)'
            : 'Image size is too large (max 5MB)',
        );
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        const newImage: ImageItem = {
          id: Date.now().toString(),
          url,
          file,
          isNew: true,
        };

        if (type === 'hero') {
          this.heroImages.update((images) => [...images, newImage]);
        } else {
          this.howItWorksImages.update((images) => [...images, newImage]);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(id: string, type: 'hero' | 'howItWorks') {
    // If it's a new image (not saved yet), just remove from local state
    const images = type === 'hero' ? this.heroImages() : this.howItWorksImages();
    const image = images.find((img) => img.id === id);

    if (image?.isNew) {
      // Just remove from local state
      if (type === 'hero') {
        this.heroImages.update((images) => images.filter((img) => img.id !== id));
      } else {
        this.howItWorksImages.update((images) => images.filter((img) => img.id !== id));
      }
    } else {
      // Delete from backend
      this.http.delete(`${environment.apiUrl}/home/images/${id}`).subscribe({
        next: () => {
          if (type === 'hero') {
            this.heroImages.update((images) => images.filter((img) => img.id !== id));
          } else {
            this.howItWorksImages.update((images) => images.filter((img) => img.id !== id));
          }
        },
        error: (error) => {
          console.error('Error deleting image:', error);
          this.error.set(this.isArabic() ? 'حدث خطأ أثناء حذف الصورة' : 'Error deleting image');
        },
      });
    }
  }

  async saveImages() {
    this.isLoading.set(true);
    this.error.set(null);
    this.success.set(null);

    try {
      // Upload Hero images
      const heroPromises = this.heroImages()
        .filter((img) => img.isNew && img.file)
        .map((img) => this.uploadImage(img.file!, 'hero'));

      // Upload How It Works images
      const howItWorksPromises = this.howItWorksImages()
        .filter((img) => img.isNew && img.file)
        .map((img) => this.uploadImage(img.file!, 'howItWorks'));

      await Promise.all([...heroPromises, ...howItWorksPromises]);

      // Clear new flags
      this.heroImages.update((images) => images.map((img) => ({ ...img, isNew: false })));
      this.howItWorksImages.update((images) => images.map((img) => ({ ...img, isNew: false })));

      this.success.set(this.isArabic() ? 'تم حفظ الصور بنجاح' : 'Images saved successfully');

      // Clear success message after 3 seconds
      setTimeout(() => {
        this.success.set(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error saving images:', error);
      if (error.status === 0) {
        this.error.set(
          this.isArabic()
            ? 'لا يمكن الاتصال بالخادم. تأكد من تشغيل الـ backend.'
            : 'Cannot connect to server. Make sure the backend is running.',
        );
      } else {
        this.error.set(
          error.error?.message ||
            (this.isArabic() ? 'حدث خطأ أثناء حفظ الصور' : 'Error saving images'),
        );
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  private uploadImage(file: File, section: 'hero' | 'howItWorks'): Promise<any> {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post(`${environment.apiUrl}/home/upload/${section}`, formData).toPromise();
  }

  goBack() {
    this.router.navigate(['/admin/panel']);
  }
}
