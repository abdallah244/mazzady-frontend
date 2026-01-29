import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslationService } from '../../core/translation.service';
import { environment } from '../../../environments/environment';
import { AssetUrlPipe } from '../../shared/pipes/asset-url.pipe';

interface AuctionProduct {
  _id: string;
  userId: {
    _id: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    email: string;
    profileImageUrl?: string;
    phone?: string;
  };
  mainImageUrl: string;
  mainImageFilename: string;
  additionalImagesUrl: string[];
  additionalImagesFilename: string[];
  startingPrice: number;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  reviewedBy?: {
    _id: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    email: string;
  };
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-auction-products',
  standalone: true,
  imports: [CommonModule, FormsModule, AssetUrlPipe],
  templateUrl: './auction-products.component.html',
  styleUrl: './auction-products.component.sass',
})
export class AuctionProductsComponent implements OnInit {
  private translationService = inject(TranslationService);
  private router = inject(Router);
  private http = inject(HttpClient);

  isArabic = computed(() => this.translationService.isArabic());

  products = signal<AuctionProduct[]>([]);
  isLoading = signal(false);
  selectedProduct = signal<AuctionProduct | null>(null);
  showRejectModal = signal(false);
  adminNoteInput = '';

  // Translations
  title = computed(() => this.translationService.t('admin.auctionProducts.title'));
  startingPrice = computed(() => this.translationService.t('admin.auctionProducts.startingPrice'));
  status = computed(() => this.translationService.t('admin.auctionProducts.status'));
  createdAt = computed(() => this.translationService.t('admin.auctionProducts.createdAt'));
  actions = computed(() => this.translationService.t('admin.auctionProducts.actions'));
  approve = computed(() => this.translationService.t('admin.auctionProducts.approve'));
  reject = computed(() => this.translationService.t('admin.auctionProducts.reject'));
  adminNote = computed(() => this.translationService.t('admin.auctionProducts.adminNote'));
  pending = computed(() => this.translationService.t('admin.auctionProducts.pending'));
  approved = computed(() => this.translationService.t('admin.auctionProducts.approved'));
  rejected = computed(() => this.translationService.t('admin.auctionProducts.rejected'));
  noProducts = computed(() => this.translationService.t('admin.auctionProducts.noProducts'));
  back = computed(() => this.translationService.t('admin.auctionProducts.back'));
  delete = computed(() => this.translationService.t('admin.auctionProducts.delete'));
  sendResponse = computed(() => this.translationService.t('admin.auctionProducts.sendResponse'));
  cancel = computed(() => this.translationService.t('admin.auctionProducts.cancel'));
  mainImage = computed(() => this.translationService.t('admin.auctionProducts.mainImage'));
  additionalImages = computed(() =>
    this.translationService.t('admin.auctionProducts.additionalImages'),
  );

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading.set(true);
    const isAdminAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
    const headers: { [key: string]: string } = {};
    if (isAdminAuthenticated) {
      headers['x-admin-authenticated'] = 'true';
    }

    this.http
      .get<AuctionProduct[]>(`${environment.apiUrl}/auction-products`, { headers })
      .subscribe({
        next: (products) => {
          this.products.set(products);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.isLoading.set(false);
        },
      });
  }

  approveProduct(product: AuctionProduct) {
    if (
      !confirm(
        this.isArabic()
          ? 'هل أنت متأكد من الموافقة على هذا المنتج؟'
          : 'Are you sure you want to approve this product?',
      )
    ) {
      return;
    }

    const isAdminAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
    const headers: { [key: string]: string } = {};
    if (isAdminAuthenticated) {
      headers['x-admin-authenticated'] = 'true';
    }

    this.http
      .put(`${environment.apiUrl}/auction-products/${product._id}/approve`, {}, { headers })
      .subscribe({
        next: () => {
          this.loadProducts();
          const message = this.isArabic()
            ? 'تمت الموافقة على المنتج بنجاح وتم إنشاء المزاد تلقائياً. هل تريد الانتقال إلى صفحة إدارة المزادات؟'
            : 'Product approved successfully and auction created automatically. Do you want to go to auctions management page?';

          if (confirm(message)) {
            this.router.navigate(['/admin/auctions-management']);
          } else {
            alert(
              this.isArabic() ? 'تمت الموافقة على المنتج بنجاح' : 'Product approved successfully',
            );
          }
        },
        error: (error) => {
          console.error('Error approving product:', error);
          alert(this.isArabic() ? 'حدث خطأ أثناء الموافقة على المنتج' : 'Error approving product');
        },
      });
  }

  openRejectModal(product: AuctionProduct) {
    this.selectedProduct.set(product);
    this.adminNoteInput = '';
    this.showRejectModal.set(true);
  }

  closeRejectModal() {
    this.showRejectModal.set(false);
    this.selectedProduct.set(null);
    this.adminNoteInput = '';
  }

  rejectProduct() {
    const product = this.selectedProduct();
    if (!product || !this.adminNoteInput.trim()) {
      return;
    }

    const isAdminAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
    const headers: { [key: string]: string } = {};
    if (isAdminAuthenticated) {
      headers['x-admin-authenticated'] = 'true';
    }

    this.http
      .put(
        `${environment.apiUrl}/auction-products/${product._id}/reject`,
        {
          adminNote: this.adminNoteInput,
        },
        { headers },
      )
      .subscribe({
        next: () => {
          this.loadProducts();
          this.closeRejectModal();
          alert(this.isArabic() ? 'تم رفض المنتج بنجاح' : 'Product rejected successfully');
        },
        error: (error) => {
          console.error('Error rejecting product:', error);
          alert(this.isArabic() ? 'حدث خطأ أثناء رفض المنتج' : 'Error rejecting product');
        },
      });
  }

  deleteProduct(product: AuctionProduct) {
    if (product.status !== 'approved' && product.status !== 'rejected') {
      return;
    }

    if (
      !confirm(
        this.isArabic()
          ? 'هل أنت متأكد من حذف هذا المنتج؟'
          : 'Are you sure you want to delete this product?',
      )
    ) {
      return;
    }

    const isAdminAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
    const headers: { [key: string]: string } = {};
    if (isAdminAuthenticated) {
      headers['x-admin-authenticated'] = 'true';
    }

    this.http
      .delete(`${environment.apiUrl}/auction-products/${product._id}`, { headers })
      .subscribe({
        next: () => {
          this.loadProducts();
          alert(this.isArabic() ? 'تم حذف المنتج بنجاح' : 'Product deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          alert(this.isArabic() ? 'حدث خطأ أثناء حذف المنتج' : 'Error deleting product');
        },
      });
  }

  goBack() {
    this.router.navigate(['/admin/panel']);
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending':
        return this.pending();
      case 'approved':
        return this.approved();
      case 'rejected':
        return this.rejected();
      default:
        return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      default:
        return '';
    }
  }
}
