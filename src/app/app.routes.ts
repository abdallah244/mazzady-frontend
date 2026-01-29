import { Routes } from '@angular/router';
import { adminGuard } from './admin/admin.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'auth/oauth-verification',
    loadComponent: () => import('./auth/oauth-verification/oauth-verification.component').then(m => m.OAuthVerificationComponent),
  },
  {
    path: 'auth/oauth-success',
    loadComponent: () => import('./auth/oauth-verification/oauth-verification.component').then(m => m.OAuthVerificationComponent),
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./admin/admin-login/admin-login.component').then(m => m.AdminLoginComponent),
  },
  {
    path: 'admin/panel',
    loadComponent: () => import('./admin/admin-panel/admin-panel.component').then(m => m.AdminPanelComponent),
    canActivate: [adminGuard],
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./admin/users-management/users-management.component').then(m => m.UsersManagementComponent),
    canActivate: [adminGuard],
  },
  {
    path: 'admin/edit-home',
    loadComponent: () => import('./admin/edit-home-page/edit-home-page.component').then(m => m.EditHomePageComponent),
    canActivate: [adminGuard],
  },
  {
    path: 'admin/money-requests',
    loadComponent: () => import('./admin/money-requests/money-requests.component').then(m => m.MoneyRequestsComponent),
    canActivate: [adminGuard],
  },
  {
    path: 'admin/customer-feedback',
    loadComponent: () => import('./admin/customer-feedback/customer-feedback.component').then(m => m.CustomerFeedbackComponent),
    canActivate: [adminGuard],
  },
  {
    path: 'admin/job-applications',
    loadComponent: () => import('./admin/job-applications/job-applications.component').then(m => m.JobApplicationsComponent),
    canActivate: [adminGuard],
  },
  {
    path: 'admin/auction-products',
    loadComponent: () => import('./admin/auction-products/auction-products.component').then(m => m.AuctionProductsComponent),
    canActivate: [adminGuard],
  },
  {
    path: 'admin/auctions-management',
    loadComponent: () => import('./admin/auctions-management/auctions-management.component').then(m => m.AuctionsManagementComponent),
    canActivate: [adminGuard],
  },
  {
    path: 'admin/send-messages',
    loadComponent: () => import('./admin/send-messages/send-messages.component').then(m => m.SendMessagesComponent),
    canActivate: [adminGuard],
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent),
  },
  {
    path: 'customer-service',
    loadComponent: () => import('./customer-service/customer-service.component').then(m => m.CustomerServiceComponent),
  },
  {
    path: 'join-us',
    loadComponent: () => import('./join-us/join-us.component').then(m => m.JoinUsComponent),
  },
  {
    path: 'sell-product',
    loadComponent: () => import('./sell-product/sell-product.component').then(m => m.SellProductComponent),
  },
  {
    path: 'auctions',
    loadComponent: () => import('./auctions/auctions.component').then(m => m.AuctionsComponent),
  },
  {
    path: 'auctions/:id',
    loadComponent: () => import('./auctions/auction-details/auction-details.component').then(m => m.AuctionDetailsComponent),
  },
  {
    path: 'cart',
    loadComponent: () => import('./cart/cart.component').then(m => m.CartComponent),
  },
  {
    path: 'notifications',
    loadComponent: () => import('./notifications/notifications.component').then(m => m.NotificationsComponent),
  },
  {
    path: 'watchlist',
    loadComponent: () => import('./watchlist/watchlist.component').then(m => m.WatchlistComponent),
  },
  {
    path: 'auto-bid',
    loadComponent: () => import('./auto-bid/auto-bid.component').then(m => m.AutoBidComponent),
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
];
