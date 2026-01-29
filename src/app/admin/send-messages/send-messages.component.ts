import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslationService } from '../../core/translation.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoadingButtonDirective } from '../../shared/loading-button.directive';
import { environment } from '../../../environments/environment';
import { AssetUrlPipe } from '../../shared/pipes/asset-url.pipe';

interface User {
  id: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  nickname: string;
}

interface Product {
  _id: string;
  productName: string;
  price: number;
  imageUrl: string;
  userId: {
    _id: string;
    nickname: string;
    email: string;
  };
  status?: 'pending' | 'available' | 'sold';
  isPaid?: boolean;
}

interface PaymentInfo {
  product: Product;
  invoice: {
    _id: string;
    productName: string;
    productPrice: number;
    shippingMethod: 'ground' | 'air';
    shippingCost: number;
    insurance: boolean;
    insuranceCost: number;
    totalAmount: number;
    shippingAddress: string;
    country: string;
    governorate: string;
    contactPhone: string;
    deliveryLocation: string;
    issuedAt: string;
    userId: {
      _id: string;
      firstName: string;
      middleName?: string;
      lastName: string;
      email: string;
      nickname: string;
      phone?: string;
      profileImageUrl?: string;
    };
  } | null;
  cartItem: any;
  isPaid: boolean;
}

@Component({
  selector: 'app-send-messages',
  imports: [CommonModule, FormsModule, LoadingButtonDirective, AssetUrlPipe],
  templateUrl: './send-messages.component.html',
  styleUrl: './send-messages.component.sass',
})
export class SendMessagesComponent implements OnInit {
  private translationService = inject(TranslationService);
  private router = inject(Router);
  private http = inject(HttpClient);

  isArabic = computed(() => this.translationService.isArabic());
  users = signal<User[]>([]);
  selectedUserId = signal<string>('');
  selectedUser = signal<User | null>(null);
  subject = signal<string>('');
  message = signal<string>('');
  searchQuery = signal<string>('');
  isLoading = signal(false);
  isSending = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  // Products management
  activeTab = signal<'messages' | 'products'>('messages');
  products = signal<Product[]>([]);
  isLoadingProducts = signal(false);
  showAddProductModal = signal(false);
  productName = signal<string>('');
  productPrice = signal<string>('');
  selectedProductUserId = signal<string>('');
  selectedProductUser = signal<User | null>(null);
  productUserSearchQuery = signal<string>('');
  selectedProductImageFile: File | null = null;
  selectedProductImage = signal<string | null>(null);
  isAddingProduct = signal(false);
  productError = signal<string | null>(null);
  productSuccess = signal<string | null>(null);
  showPaymentDetailsModal = signal(false);
  selectedPaymentInfo = signal<PaymentInfo | null>(null);
  isLoadingPaymentInfo = signal(false);
  paymentInfoError = signal<string | null>(null);

  filteredUsers = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.users();
    return this.users().filter(
      (user) =>
        user.email.toLowerCase().includes(query) ||
        user.nickname.toLowerCase().includes(query) ||
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query),
    );
  });

  filteredProductUsers = computed(() => {
    const query = this.productUserSearchQuery().toLowerCase();
    if (!query) return this.users();
    return this.users().filter(
      (user) =>
        user.email.toLowerCase().includes(query) ||
        user.nickname.toLowerCase().includes(query) ||
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query),
    );
  });

  ngOnInit() {
    this.loadUsers();
    this.loadProducts();
  }

  loadUsers() {
    this.isLoading.set(true);
    this.error.set(null);

    const isAdminAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
    const headers = new HttpHeaders({
      'x-admin-authenticated': isAdminAuthenticated ? 'true' : 'false',
    });

    this.http.get<User[]>(`${environment.apiUrl}/admin/users`, { headers }).subscribe({
      next: (users) => {
        this.users.set(users);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.error.set(this.isArabic() ? 'حدث خطأ أثناء تحميل المستخدمين' : 'Error loading users');
        this.isLoading.set(false);
      },
    });
  }

  selectUser(user: User) {
    this.selectedUserId.set(user.id);
    this.selectedUser.set(user);
    this.searchQuery.set(user.nickname);
  }

  sendMessage() {
    if (!this.selectedUserId() || !this.subject().trim() || !this.message().trim()) {
      this.error.set(
        this.isArabic() ? 'الرجاء ملء جميع الحقول المطلوبة' : 'Please fill all required fields',
      );
      return;
    }

    this.isSending.set(true);
    this.error.set(null);
    this.success.set(null);

    const isAdminAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
    const headers = new HttpHeaders({
      'x-admin-authenticated': isAdminAuthenticated ? 'true' : 'false',
    });

    this.http
      .post(
        `${environment.apiUrl}/admin-messages`,
        {
          userId: this.selectedUserId(),
          subject: this.subject(),
          message: this.message(),
        },
        { headers },
      )
      .subscribe({
        next: () => {
          this.success.set(
            this.isArabic() ? 'تم إرسال الرسالة بنجاح' : 'Message sent successfully',
          );
          this.subject.set('');
          this.message.set('');
          this.selectedUserId.set('');
          this.selectedUser.set(null);
          this.searchQuery.set('');
          this.isSending.set(false);

          setTimeout(() => {
            this.success.set(null);
          }, 3000);
        },
        error: (error) => {
          console.error('Error sending message:', error);
          this.error.set(this.isArabic() ? 'حدث خطأ أثناء إرسال الرسالة' : 'Error sending message');
          this.isSending.set(false);
        },
      });
  }

  // Products management methods
  loadProducts() {
    this.isLoadingProducts.set(true);

    const isAdminAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
    const headers = new HttpHeaders({
      'x-admin-authenticated': isAdminAuthenticated ? 'true' : 'false',
    });

    this.http.get<Product[]>(`${environment.apiUrl}/products`, { headers }).subscribe({
      next: (products) => {
        // Check payment status for each product
        Promise.all(
          products.map((product) => {
            return this.http
              .get<PaymentInfo>(`${environment.apiUrl}/products/${product._id}/payment-info`, {
                headers,
              })
              .toPromise()
              .then((paymentInfo) => ({ ...product, isPaid: paymentInfo?.isPaid || false }))
              .catch(() => ({ ...product, isPaid: false }));
          }),
        ).then((productsWithPaymentStatus) => {
          this.products.set(productsWithPaymentStatus);
          this.isLoadingProducts.set(false);
        });
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isLoadingProducts.set(false);
      },
    });
  }

  async showPaymentDetails(productId: string) {
    this.isLoadingPaymentInfo.set(true);
    this.paymentInfoError.set(null);
    this.selectedPaymentInfo.set(null);
    this.showPaymentDetailsModal.set(true);

    const isAdminAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
    const headers = new HttpHeaders({
      'x-admin-authenticated': isAdminAuthenticated ? 'true' : 'false',
    });

    this.http
      .get<PaymentInfo>(`${environment.apiUrl}/products/${productId}/payment-info`, { headers })
      .subscribe({
        next: (paymentInfo) => {
          console.log('Payment info loaded:', paymentInfo);
          this.selectedPaymentInfo.set(paymentInfo);
          this.isLoadingPaymentInfo.set(false);
        },
        error: (error) => {
          console.error('Error loading payment info:', error);
          this.paymentInfoError.set(
            this.isArabic() ? 'حدث خطأ أثناء تحميل معلومات الدفع' : 'Error loading payment info',
          );
          this.isLoadingPaymentInfo.set(false);
        },
      });
  }

  closePaymentDetailsModal() {
    this.showPaymentDetailsModal.set(false);
    this.selectedPaymentInfo.set(null);
    this.paymentInfoError.set(null);
  }

  selectProductUser(user: User) {
    this.selectedProductUserId.set(user.id);
    this.selectedProductUser.set(user);
    this.productUserSearchQuery.set(user.nickname);
  }

  onProductImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.productError.set(
          this.isArabic()
            ? 'حجم الصورة كبير جداً (الحد الأقصى 5MB)'
            : 'Image size is too large (max 5MB)',
        );
        return;
      }
      this.selectedProductImageFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedProductImage.set(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  removeProductImage() {
    this.selectedProductImageFile = null;
    this.selectedProductImage.set(null);
  }

  closeAddProductModal() {
    this.showAddProductModal.set(false);
    this.productName.set('');
    this.productPrice.set('');
    this.selectedProductUserId.set('');
    this.selectedProductUser.set(null);
    this.productUserSearchQuery.set('');
    this.selectedProductImageFile = null;
    this.selectedProductImage.set(null);
    this.productError.set(null);
    this.productSuccess.set(null);
  }

  addProduct() {
    if (
      !this.productName().trim() ||
      !this.productPrice() ||
      !this.selectedProductUserId() ||
      !this.selectedProductImageFile
    ) {
      this.productError.set(
        this.isArabic() ? 'الرجاء ملء جميع الحقول المطلوبة' : 'Please fill all required fields',
      );
      return;
    }

    this.isAddingProduct.set(true);
    this.productError.set(null);
    this.productSuccess.set(null);

    const formData = new FormData();
    formData.append('productName', this.productName());
    formData.append('price', this.productPrice());
    formData.append('userId', this.selectedProductUserId());
    formData.append('image', this.selectedProductImageFile!);

    const isAdminAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
    const headers = new HttpHeaders({
      'x-admin-authenticated': isAdminAuthenticated ? 'true' : 'false',
    });

    this.http.post(`${environment.apiUrl}/products`, formData, { headers }).subscribe({
      next: (response: any) => {
        this.productSuccess.set(
          this.isArabic()
            ? 'تم إضافة المنتج بنجاح وإضافته إلى الكارت الخاص بالمستخدم'
            : 'Product added successfully and added to user cart',
        );
        this.loadProducts();
        // Add product to user's cart automatically
        this.addProductToUserCart(response._id);
        this.isAddingProduct.set(false);
        setTimeout(() => {
          this.closeAddProductModal();
        }, 2000);
      },
      error: (error) => {
        console.error('Error adding product:', error);
        this.productError.set(
          this.isArabic() ? 'حدث خطأ أثناء إضافة المنتج' : 'Error adding product',
        );
        this.isAddingProduct.set(false);
      },
    });
  }

  addProductToUserCart(productId: string) {
    this.http
      .post(`${environment.apiUrl}/cart/add`, {
        userId: this.selectedProductUserId(),
        productId: productId,
      })
      .subscribe({
        next: () => {
          console.log('Product added to user cart successfully');
        },
        error: (error) => {
          console.error('Error adding product to cart:', error);
        },
      });
  }

  approveProduct(productId: string) {
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
    const headers = new HttpHeaders({
      'x-admin-authenticated': isAdminAuthenticated ? 'true' : 'false',
    });

    this.http
      .put(`${environment.apiUrl}/products/${productId}/approve`, {}, { headers })
      .subscribe({
        next: () => {
          this.loadProducts();
          this.productSuccess.set(
            this.isArabic() ? 'تمت الموافقة على المنتج بنجاح' : 'Product approved successfully',
          );
          setTimeout(() => {
            this.productSuccess.set(null);
          }, 3000);
        },
        error: (error) => {
          console.error('Error approving product:', error);
          this.productError.set(
            this.isArabic() ? 'حدث خطأ أثناء الموافقة على المنتج' : 'Error approving product',
          );
          setTimeout(() => {
            this.productError.set(null);
          }, 3000);
        },
      });
  }

  deleteProduct(productId: string) {
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
    const headers = new HttpHeaders({
      'x-admin-authenticated': isAdminAuthenticated ? 'true' : 'false',
    });

    this.http.delete(`${environment.apiUrl}/products/${productId}`, { headers }).subscribe({
      next: () => {
        this.loadProducts();
      },
      error: (error) => {
        console.error('Error deleting product:', error);
      },
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat(this.isArabic() ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2,
    }).format(price);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString(this.isArabic() ? 'ar-EG' : 'en-US');
  }

  goBack() {
    this.router.navigate(['/admin/panel']);
  }
}
