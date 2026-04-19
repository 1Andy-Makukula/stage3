// KithLy Header - Global Navigation

import { useEffect, useState } from 'react';
import { ShoppingCart, User, Menu, Gift, Bell, QrCode, Globe, LayoutDashboard, Store } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { Badge } from '../ui/badge';
import { SearchBar } from '../shared/SearchBar';
import { getUnreadCount, subscribeNotifications } from '../../lib/notifications';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface HeaderProps {
  onMenuClick?: () => void;
  onCartClick?: () => void;
  onProfileClick?: () => void;
  onLogoClick?: () => void;
}

export function Header({
  onMenuClick,
  onCartClick,
  onProfileClick,
  onLogoClick,
}: HeaderProps) {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { getTotalItems } = useCart();
  const cartItemCount = getTotalItems();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const audience = user?.role === 'merchant' ? 'merchant' : 'buyer';
    const refresh = () => setUnreadCount(getUnreadCount(audience));
    refresh();
    return subscribeNotifications(refresh);
  }, [user?.role]);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left: Menu + Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            </button>

            <button
              onClick={onLogoClick}
              className="flex items-center gap-2 group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F97316] to-[#FB923C] flex items-center justify-center">
                <Gift className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <span className="text-xl font-light tracking-tight text-black group-hover:bg-gradient-to-r group-hover:from-[#F97316] group-hover:to-[#FB923C] group-hover:bg-clip-text group-hover:text-transparent transition-all">
                KithLy
              </span>
            </button>
          </div>

          {/* Center: Search (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Currency/Language Toggle */}
            <div className="hidden lg:flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer text-muted-foreground mr-1">
              <Globe className="w-4 h-4" strokeWidth={1.5} />
              <select className="bg-transparent text-xs font-light focus:outline-none cursor-pointer">
                <option value="ZMW">ZMW</option>
                <option value="GBP">GBP</option>
                <option value="USD">USD</option>
              </select>
            </div>

            {/* Scan */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { /* Navigate to scan */ }}
              className="hidden md:block p-2 hover:bg-gray-100 rounded-lg transition-colors text-muted-foreground"
              aria-label="Scan QR Code"
            >
              <QrCode className="w-5 h-5" strokeWidth={1.5} />
            </motion.button>

            {/* Notifications */}
            {isAuthenticated && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/notifications')}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors text-muted-foreground"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" strokeWidth={1.5} />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 bg-red-500 text-white text-[10px] rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </motion.button>
            )}
            {/* Cart */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (onCartClick) {
                  onCartClick();
                  return;
                }
                navigate('/checkout');
              }}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 bg-gradient-to-r from-[#F97316] to-[#FB923C] text-white text-xs">
                  {cartItemCount}
                </Badge>
              )}
            </motion.button>

            {/* Profile */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F97316] to-[#FB923C] flex items-center justify-center">
                      <span className="text-white text-sm font-light">
                        {user?.full_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="hidden md:inline text-sm font-light">
                      {user?.full_name?.split(' ')[0]}
                    </span>
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <LayoutDashboard className="w-4 h-4" /> My Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/notifications')}>
                    <Bell className="w-4 h-4" /> Notifications
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Persona Switch
                  </div>
                  <DropdownMenuItem onClick={() => navigate('/merchant/dashboard')}>
                    <Store className="w-4 h-4" /> Switch to Merchant Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/')}>
                    <User className="w-4 h-4" /> Switch to Customer View
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onProfileClick}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#F97316] to-[#FB923C] text-white rounded-full font-light"
              >
                <User className="w-4 h-4" strokeWidth={1.5} />
                <span className="hidden md:inline">Sign In</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <SearchBar />
        </div>
      </div>
    </header>
  );
}
