import { Component, inject, computed, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslationService } from '../core/translation.service';
import { AuthService } from '../auth/auth.service';
import { LoadingButtonDirective } from '../shared/loading-button.directive';
import { AssetUrlPipe } from '../shared/pipes/asset-url.pipe';
import { environment } from '../../environments/environment';

interface CartItem {
  _id: string;
  userId: string;
  productId: {
    _id: string;
    productName: string;
    price: number;
    imageUrl: string;
    userId: {
      _id: string;
      nickname: string;
      email: string;
    };
  };
  shippingMethod: 'ground' | 'air';
  insurance: boolean;
  status: string;
  addedAt: string;
}

interface CartTotal {
  total: number;
  items: Array<{
    cartItem: CartItem;
    product: any;
    shippingCost: number;
    insuranceCost: number;
    itemTotal: number;
  }>;
}

interface Invoice {
  _id: string;
  productName: string;
  productPrice: number;
  shippingMethod: 'ground' | 'air';
  shippingCost: number;
  insurance: boolean;
  insuranceCost: number;
  totalAmount: number;
  shippingAddress?: string;
  country?: string;
  governorate?: string;
  contactPhone?: string;
  deliveryLocation?: string;
  issuedAt: string;
  success?: boolean;
  message?: string;
}

interface ShippingForm {
  country: string;
  governorate: string;
  address: string;
  contactPhone: string;
  deliveryLocation: string;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingButtonDirective, AssetUrlPipe],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.sass',
})
export class CartComponent implements OnInit, OnDestroy {
  private translationService = inject(TranslationService);
  private router = inject(Router);
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  isArabic = computed(() => this.translationService.isArabic());

  cartItems = signal<CartItem[]>([]);
  cartTotal = signal<CartTotal | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  showInvoiceModal = signal(false);
  showAddressModal = signal(false);
  showShippingHint = signal(false);
  selectedInvoice = signal<Invoice | null>(null);
  isPurchasing = signal(false);
  purchaseError = signal<string | null>(null);
  shippingForm: ShippingForm = {
    country: '',
    governorate: '',
    address: '',
    contactPhone: '',
    deliveryLocation: '',
  };
  selectedCartItem = signal<CartItem | null>(null);

  currentUserId = signal<string>('');

  private updateInterval: any;

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      this.router.navigate(['/login']);
      return;
    }
    this.currentUserId.set(currentUser.id);
    this.loadCart();
    // Update cart every 30 seconds
    this.updateInterval = setInterval(() => this.loadCart(), 30000);
  }

  ngOnDestroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  loadCart() {
    const userId = this.currentUserId();
    if (!userId) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.http.get<CartItem[]>(`${environment.apiUrl}/cart/user/${userId}`).subscribe({
      next: (items) => {
        this.cartItems.set(items);
        this.calculateCartTotal(userId);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading cart:', err);
        this.error.set(this.isArabic() ? 'حدث خطأ أثناء تحميل الكارت' : 'Error loading cart');
        this.isLoading.set(false);
      },
    });
  }

  calculateCartTotal(userId: string) {
    this.http.get<CartTotal>(`${environment.apiUrl}/cart/total/${userId}`).subscribe({
      next: (totalData) => {
        this.cartTotal.set(totalData);
      },
      error: (err) => {
        console.error('Error calculating cart total:', err);
      },
    });
  }

  updateShippingMethod(itemId: string, method: 'ground' | 'air') {
    const item = this.cartItems().find((i) => i._id === itemId);
    if (!item) return;
    this.updateCartItem(item, 'shippingMethod', method);
  }

  updateInsurance(itemId: string, value: boolean) {
    const item = this.cartItems().find((i) => i._id === itemId);
    if (!item) return;
    this.updateCartItem(item, 'insurance', value);
  }

  updateCartItem(item: CartItem, field: 'shippingMethod' | 'insurance', value: any) {
    const userId = this.currentUserId();
    if (!userId) return;

    const body: { userId: string; shippingMethod?: 'ground' | 'air'; insurance?: boolean } = {
      userId,
    };
    if (field === 'shippingMethod') {
      body.shippingMethod = value;
    } else if (field === 'insurance') {
      body.insurance = value;
    }

    this.http.put(`${environment.apiUrl}/cart/${item._id}`, body).subscribe({
      next: () => {
        this.loadCart();
      },
      error: (err) => {
        console.error('Error updating cart item:', err);
      },
    });
  }

  openAddressModal(item: CartItem) {
    this.selectedCartItem.set(item);
    this.shippingForm = {
      country: '',
      governorate: '',
      address: '',
      contactPhone: '',
      deliveryLocation: '',
    };
    this.showAddressModal.set(true);
    this.purchaseError.set(null);
  }

  closeAddressModal() {
    this.showAddressModal.set(false);
    this.selectedCartItem.set(null);
    this.shippingForm = {
      country: '',
      governorate: '',
      address: '',
      contactPhone: '',
      deliveryLocation: '',
    };
    this.purchaseError.set(null);
  }

  toggleShippingHint() {
    this.showShippingHint.set(!this.showShippingHint());
  }

  completePurchase() {
    // Validate form
    if (
      !this.shippingForm.country ||
      !this.shippingForm.governorate ||
      !this.shippingForm.address ||
      !this.shippingForm.contactPhone ||
      !this.shippingForm.deliveryLocation
    ) {
      this.purchaseError.set(
        this.isArabic()
          ? 'الرجاء إدخال جميع البيانات المطلوبة'
          : 'Please fill in all required fields',
      );
      return;
    }

    if (this.shippingForm.address.trim().length < 10) {
      this.purchaseError.set(
        this.isArabic()
          ? 'الرجاء إدخال عنوان صحيح (10 أحرف على الأقل)'
          : 'Please enter a valid address (at least 10 characters)',
      );
      return;
    }

    if (!/^(\+20|0)?1[0-9]{9}$/.test(this.shippingForm.contactPhone.replace(/\s+/g, ''))) {
      this.purchaseError.set(
        this.isArabic()
          ? 'الرجاء إدخال رقم هاتف مصري صحيح'
          : 'Please enter a valid Egyptian phone number',
      );
      return;
    }

    const item = this.selectedCartItem();
    if (!item) return;

    const userId = this.currentUserId();
    if (!userId) return;

    this.isPurchasing.set(true);
    this.purchaseError.set(null);

    this.http
      .post<Invoice>(`${environment.apiUrl}/cart/purchase`, {
        userId,
        cartItemId: item._id,
        shippingAddress: this.shippingForm.address.trim(),
        country: this.shippingForm.country.trim(),
        governorate: this.shippingForm.governorate.trim(),
        contactPhone: this.shippingForm.contactPhone.trim(),
        deliveryLocation: this.shippingForm.deliveryLocation.trim(),
      })
      .subscribe({
        next: (invoice) => {
          this.selectedInvoice.set({ ...invoice, success: true });
          this.showAddressModal.set(false);
          this.showInvoiceModal.set(true);
          this.isPurchasing.set(false);
          this.shippingForm = {
            country: '',
            governorate: '',
            address: '',
            contactPhone: '',
            deliveryLocation: '',
          };
          this.selectedCartItem.set(null);
          this.loadCart();
        },
        error: (err) => {
          console.error('Error purchasing item:', err);
          const errorMessage = err.error?.message || err.message || 'Unknown error';
          this.purchaseError.set(
            errorMessage.includes('Insufficient') || errorMessage.includes('balance')
              ? this.isArabic()
                ? 'رصيد المحفظة غير كافي'
                : 'Insufficient wallet balance'
              : errorMessage.includes('not found')
                ? this.isArabic()
                  ? 'المنتج غير موجود'
                  : 'Product not found'
                : this.isArabic()
                  ? 'حدث خطأ أثناء الشراء'
                  : 'Error during purchase',
          );
          this.selectedInvoice.set({
            _id: '',
            productName: item.productId.productName,
            productPrice: item.productId.price,
            shippingMethod: item.shippingMethod,
            shippingCost: 0,
            insurance: item.insurance,
            insuranceCost: item.insurance ? item.productId.price * 0.1 : 0,
            totalAmount: 0,
            shippingAddress: this.shippingForm.address.trim(),
            country: this.shippingForm.country.trim(),
            governorate: this.shippingForm.governorate.trim(),
            contactPhone: this.shippingForm.contactPhone.trim(),
            deliveryLocation: this.shippingForm.deliveryLocation.trim(),
            issuedAt: new Date().toISOString(),
            success: false,
            message: this.purchaseError() || undefined,
          });
          this.showAddressModal.set(false);
          this.showInvoiceModal.set(true);
          this.isPurchasing.set(false);
        },
      });
  }

  closeInvoiceModal() {
    this.showInvoiceModal.set(false);
    this.selectedInvoice.set(null);
  }

  downloadInvoice() {
    const invoice = this.selectedInvoice();
    if (!invoice) return;

    const invoiceHtml = `
<!DOCTYPE html>
<html lang="${this.isArabic() ? 'ar' : 'en'}" dir="${this.isArabic() ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.isArabic() ? 'فاتورة' : 'Invoice'}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      direction: ${this.isArabic() ? 'rtl' : 'ltr'};
    }
    .invoice-header {
      text-align: center;
      margin-bottom: 30px;
    }
    .invoice-details {
      margin: 20px 0;
    }
    .invoice-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #ddd;
    }
    .invoice-total {
      font-size: 1.2em;
      font-weight: bold;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 2px solid #000;
    }
  </style>
</head>
<body>
  <div class="invoice-header">
    <h1>${this.isArabic() ? 'فاتورة' : 'Invoice'}</h1>
    <p>Mazzady</p>
  </div>
  <div class="invoice-details">
    <div class="invoice-row">
      <span class="invoice-label">${this.isArabic() ? 'اسم المنتج:' : 'Product Name:'}</span>
      <span>${invoice.productName}</span>
    </div>
    <div class="invoice-row">
      <span class="invoice-label">${this.isArabic() ? 'سعر المنتج:' : 'Product Price:'}</span>
      <span>${this.formatPrice(invoice.productPrice)}</span>
    </div>
    <div class="invoice-row">
      <span class="invoice-label">${this.isArabic() ? 'طريقة الشحن:' : 'Shipping Method:'}</span>
      <span>${invoice.shippingMethod === 'air' ? (this.isArabic() ? 'جوي' : 'Air') : this.isArabic() ? 'بري' : 'Ground'}</span>
    </div>
    <div class="invoice-row">
      <span class="invoice-label">${this.isArabic() ? 'تكلفة الشحن:' : 'Shipping Cost:'}</span>
      <span>${this.formatPrice(invoice.shippingCost)}</span>
    </div>
    <div class="invoice-row">
      <span class="invoice-label">${this.isArabic() ? 'التأمين:' : 'Insurance:'}</span>
      <span>${invoice.insurance ? (this.isArabic() ? 'نعم' : 'Yes') : this.isArabic() ? 'لا' : 'No'}</span>
    </div>
    ${
      invoice.insurance
        ? `<div class="invoice-row">
      <span class="invoice-label">${this.isArabic() ? 'تكلفة التأمين:' : 'Insurance Cost:'}</span>
      <span>${this.formatPrice(invoice.insuranceCost)}</span>
    </div>`
        : ''
    }
    <div class="invoice-total">
      <span class="invoice-label">${this.isArabic() ? 'المبلغ الإجمالي:' : 'Total Amount:'}</span>
      <span>${this.formatPrice(invoice.totalAmount)}</span>
    </div>
    ${
      invoice.country ||
      invoice.governorate ||
      invoice.shippingAddress ||
      invoice.contactPhone ||
      invoice.deliveryLocation
        ? `
    <div class="invoice-section">
      <h3 style="color: var(--accent-primary); margin: 20px 0 10px 0; font-size: 18px;">${this.isArabic() ? 'معلومات الشحن:' : 'Shipping Information:'}</h3>
      ${
        invoice.country
          ? `<div class="invoice-row">
        <span class="invoice-label">${this.isArabic() ? 'الدولة:' : 'Country:'}</span>
        <span>${invoice.country}</span>
      </div>`
          : ''
      }
      ${
        invoice.governorate
          ? `<div class="invoice-row">
        <span class="invoice-label">${this.isArabic() ? 'المحافظة:' : 'Governorate:'}</span>
        <span>${invoice.governorate}</span>
      </div>`
          : ''
      }
      ${
        invoice.shippingAddress
          ? `<div class="invoice-row">
        <span class="invoice-label">${this.isArabic() ? 'عنوان السكن:' : 'Address:'}</span>
        <span>${invoice.shippingAddress}</span>
      </div>`
          : ''
      }
      ${
        invoice.contactPhone
          ? `<div class="invoice-row">
        <span class="invoice-label">${this.isArabic() ? 'رقم التواصل:' : 'Contact Phone:'}</span>
        <span>${invoice.contactPhone}</span>
      </div>`
          : ''
      }
      ${
        invoice.deliveryLocation
          ? `<div class="invoice-row">
        <span class="invoice-label">${this.isArabic() ? 'مكان التوصيل:' : 'Delivery Location:'}</span>
        <span>${invoice.deliveryLocation}</span>
      </div>`
          : ''
      }
    </div>
    `
        : ''
    }
    <div class="invoice-row">
      <span class="invoice-label">${this.isArabic() ? 'تاريخ الإصدار:' : 'Issue Date:'}</span>
      <span>${this.formatDate(invoice.issuedAt)}</span>
    </div>
  </div>
</body>
</html>
    `;

    // Create blob and download
    const blob = new Blob([invoiceHtml], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${invoice._id}.html`;
    link.click();
    window.URL.revokeObjectURL(url);
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

  getDaysUntilLegalAction(addedAt: string): number {
    const addedDate = new Date(addedAt);
    const currentDate = new Date();
    const diffTime = currentDate.getTime() - addedDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, 14 - diffDays);
  }

  shouldShowLegalWarning(addedAt: string): boolean {
    return this.getDaysUntilLegalAction(addedAt) <= 7;
  }
}
