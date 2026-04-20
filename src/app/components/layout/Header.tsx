import { useEffect, useState } from 'react';
import { ShoppingCart, Menu, Gift, Bell, QrCode, Globe, LayoutDashboard, Store, LogOut, User, ShieldCheck, Eye, EyeOff } from 'lucide-react';
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
  DropdownMenuLabel,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';

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
  const { isAuthenticated, user, profile, signOut } = useAuth();
  const { getTotalItems } = useCart();
  const cartItemCount = getTotalItems();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  // Logic Engine: Identity Recognition
  const isGoogleUser = user?.app_metadata?.provider === 'google';

  useEffect(() => {
    const audience = profile?.role === 'merchant' ? 'merchant' : 'buyer';
    const refresh = () => setUnreadCount(getUnreadCount(audience));
    refresh();
    return subscribeNotifications(refresh);
  }, [profile?.role]);

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

            {/* Profile Dropdown (Identity Recognition) */}
            {isAuthenticated && profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 outline-none hover:bg-gray-50 p-1 rounded-full transition-colors">
                  <Avatar className="w-8 h-8">
                     <AvatarImage src={profile.avatar_url} />
                     <AvatarFallback className="bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white">
                        <User className="w-4 h-4" />
                     </AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden lg:block pr-2">
                    <p className="text-sm font-medium text-black truncate max-w-[120px]">{profile.full_name}</p>
                    <p className="text-[10px] text-muted-foreground capitalize font-light">{profile.role}</p>
                  </div>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2">
                  <DropdownMenuLabel className="font-light text-muted-foreground px-3 py-2">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={() => navigate('/dashboard')} className="rounded-lg">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>My Dashboard</span>
                  </DropdownMenuItem>

                  {/* Admin Dashboard: Global Console Entry Point */}
                  {profile.role === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')} className="rounded-lg text-blue-600 focus:text-blue-700">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      <span className="font-medium tracking-tight uppercase text-xs">Global Console</span>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  {/* Password Recognition Logic */}
                  {!isGoogleUser ? (
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="rounded-lg focus:bg-transparent">
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] text-muted-foreground tracking-widest uppercase">
                          {showPassword ? '••••••••' : 'Secured PWD'}
                        </span>
                        <button 
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem disabled className="text-xs text-muted-foreground italic px-3">
                      Managed by Google
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="text-red-600 rounded-lg focus:bg-red-50 focus:text-red-700">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span className="font-medium">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onProfileClick}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#F97316] to-[#FB923C] text-white rounded-full font-light text-sm"
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
