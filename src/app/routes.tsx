// KithLy Routes - React Router Configuration

import { createBrowserRouter } from 'react-router';
import { Root } from './layouts/Root';
import { LandingPage } from './pages/LandingPage';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { MerchantDashboard } from './pages/MerchantDashboard';
import { MerchantLayout } from './layouts/MerchantLayout';
import { MerchantOnboarding } from './pages/MerchantOnboarding';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProductDetail } from './pages/ProductDetail';
import { ShopProfile } from './pages/ShopProfile';
import { ShopDirectory } from './pages/ShopDirectory';
import { Checkout } from './pages/Checkout';
import { Wishlist } from './pages/Wishlist';
import { Support } from './pages/Support';
import { About } from './pages/About';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { MerchantAgreement } from './pages/MerchantAgreement';
import { Notifications } from './pages/Notifications';
import { AuthPage } from './pages/AuthPage';
import { NotFound } from './pages/NotFound';
import { ClaimPage } from './pages/ClaimPage';

export const router = createBrowserRouter([
  {
    path: '/claim/:id',
    Component: ClaimPage,
  },
  {
    path: '/',
    Component: Root,
    children: [
      {
        index: true,
        Component: LandingPage,
      },
      {
        path: 'dashboard',
        Component: CustomerDashboard,
      },
      {
        path: 'merchant',
        Component: MerchantLayout,
        children: [
          {
            index: true,
            Component: MerchantDashboard,
          },
          {
            path: 'dashboard',
            Component: MerchantDashboard,
          }
        ]
      },
      {
        path: 'merchant/apply',
        Component: MerchantOnboarding,
      },
      {
        path: 'admin',
        Component: AdminDashboard,
      },
      {
        path: 'product/:id',
        Component: ProductDetail,
      },
      {
        path: 'shop/:id',
        Component: ShopProfile,
      },
      {
        path: 'shops',
        Component: ShopDirectory,
      },
      {
        path: 'checkout',
        Component: Checkout,
      },
      {
        path: 'wishlist',
        Component: Wishlist,
      },
      {
        path: 'notifications',
        Component: Notifications,
      },
      {
        path: 'support',
        Component: Support,
      },
      {
        path: 'about',
        Component: About,
      },
      {
        path: 'terms',
        Component: Terms,
      },
      {
        path: 'privacy',
        Component: Privacy,
      },
      {
        path: 'merchant-agreement',
        Component: MerchantAgreement,
      },
      {
        path: 'auth',
        Component: AuthPage,
      },
      {
        path: '*',
        Component: NotFound,
      },
    ],
  },
]);
