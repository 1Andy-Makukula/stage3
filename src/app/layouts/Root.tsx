// KithLy Root Layout - Main App Container

import { Outlet, useNavigate } from 'react-router';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { ProfileVerificationBanner } from '../components/shared/ProfileVerificationBanner';
import { BackToTop } from '../components/shared/BackToTop';
import { Toaster } from '../components/ui/sonner';
import { useAuth } from '../hooks/useAuth';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../components/ui/sheet';
import { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { formatZMW } from '../utils/formatters';
import { OfflineBanner } from '../components/shared/OfflineBanner';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { X, Home, User as UserIcon, Store, ShoppingBag, Heart, Bell, HelpCircle, Plus, Minus } from 'lucide-react';
import { motion } from 'motion/react';

export function Root() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { items, removeFromCart, updateQuantity, getTotalAmount, clearCart } = useCart();
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleCartClick = () => {
    setIsCartOpen(true);
  };

  const handleProfileClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };
  
  const handleCompleteProfile = () => {
    navigate('/dashboard');
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        onMenuClick={() => setIsMobileMenuOpen(true)}
        onCartClick={handleCartClick}
        onProfileClick={handleProfileClick}
        onLogoClick={handleLogoClick}
      />
      
      <OfflineBanner />
      
      {/* Profile Verification Banner */}
      {isAuthenticated && <ProfileVerificationBanner onComplete={handleCompleteProfile} />}

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />

      {/* Cart Sheet */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="font-light">Shopping Cart</SheetTitle>
          </SheetHeader>

          <div className="flex flex-col h-[calc(100vh-120px)]">
            {items.length > 0 ? (
              <>
                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto space-y-4 py-4">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <ImageWithFallback
                          src={item.product.images[0]}
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-light text-sm text-black line-clamp-2">
                          {item.product.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            <Minus className="w-3 h-3" strokeWidth={1.5} />
                          </button>
                          <p className="text-xs font-light text-muted-foreground w-4 text-center">
                            {item.quantity}
                          </p>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            <Plus className="w-3 h-3" strokeWidth={1.5} />
                          </button>
                        </div>
                        <p className="text-sm font-medium text-[#F97316] mt-1">
                          {formatZMW(item.product.price_zmw * item.quantity)}
                        </p>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors h-fit"
                      >
                        <X className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Cart Summary */}
                <div className="border-t border-border pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-light">Total</span>
                    <span className="text-xl font-medium bg-gradient-to-r from-[#F97316] to-[#FB923C] bg-clip-text text-transparent">
                      {formatZMW(getTotalAmount())}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCheckout}
                      className="w-full py-3 bg-gradient-to-r from-[#F97316] to-[#FB923C] text-white rounded-full font-light shadow-lg"
                    >
                      Proceed to Checkout
                    </motion.button>

                    <button
                      onClick={() => clearCart()}
                      className="w-full py-2 text-sm font-light text-muted-foreground hover:text-destructive transition-colors"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" strokeWidth={1.5} />
                  <h3 className="font-light text-black mb-2">Your cart is empty</h3>
                  <p className="text-sm font-light text-muted-foreground mb-6">
                    Start adding gifts to your cart
                  </p>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      navigate('/');
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-[#F97316] to-[#FB923C] text-white rounded-full font-light"
                  >
                    Browse Marketplace
                  </button>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile Menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle className="font-light">Menu</SheetTitle>
          </SheetHeader>

          <nav className="space-y-2 mt-6">
            <button
              onClick={() => {
                navigate('/');
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors font-light"
            >
              <Home className="w-5 h-5" strokeWidth={1.5} />
              Home
            </button>

            <button
              onClick={() => {
                navigate('/shops');
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors font-light"
            >
              <Store className="w-5 h-5" strokeWidth={1.5} />
              Browse Shops
            </button>

            {isAuthenticated && (
              <>
                <button
                  onClick={() => {
                    navigate('/dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors font-light"
                >
                  <UserIcon className="w-5 h-5" strokeWidth={1.5} />
                  My Dashboard
                </button>

                <button
                  onClick={() => {
                    navigate('/wishlist');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors font-light"
                >
                  <Heart className="w-5 h-5" strokeWidth={1.5} />
                  Wishlist
                </button>

                <button
                  onClick={() => {
                    navigate('/notifications');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors font-light"
                >
                  <Bell className="w-5 h-5" strokeWidth={1.5} />
                  Notifications
                </button>
              </>
            )}

            <button
              onClick={() => {
                navigate('/merchant');
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors font-light"
            >
              <Store className="w-5 h-5" strokeWidth={1.5} />
              Merchant Terminal
            </button>

            <button
              onClick={() => {
                navigate('/support');
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors font-light"
            >
              <HelpCircle className="w-5 h-5" strokeWidth={1.5} />
              Help & Support
            </button>

            {isAuthenticated && (
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                  navigate('/');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 rounded-lg transition-colors font-light mt-6"
              >
                Logout
              </button>
            )}
          </nav>
        </SheetContent>
      </Sheet>

      <BackToTop />
      <Toaster position="bottom-right" />
    </div>
  );
}