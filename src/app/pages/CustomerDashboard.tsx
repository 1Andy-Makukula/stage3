// KithLy Customer Dashboard - Comprehensive User Hub

import { useState } from 'react';
import { Package, Clock, CheckCircle, AlertCircle, User, Settings, Bell, Heart, Gift, Camera, HeartHandshake, Smile, TrendingUp, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { mockTransactions } from '../data/mock-data';
import { formatZMW, daysUntilExpiry, formatRelativeTime } from '../utils/formatters';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import type { Transaction } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';

export function CustomerDashboard() {
  const { user } = useAuth();
  
  const [profileForm, setProfileForm] = useState({
    fullName: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const handleProfileSave = () => {
    toast.success('Profile updated successfully');
  };
  const sentActiveGifts = mockTransactions.filter(t => t.status === 'in_escrow');
  const sentCompletedGifts = mockTransactions.filter(t => t.status === 'completed');
  // For UI testing, pretend completed ones are received gifts
  const receivedGifts = mockTransactions.filter(t => t.status === 'completed');

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'in_escrow':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'disputed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'in_escrow':
        return <Clock className="w-4 h-4" strokeWidth={1.5} />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" strokeWidth={1.5} />;
      case 'disputed':
        return <AlertCircle className="w-4 h-4" strokeWidth={1.5} />;
      default:
        return <Package className="w-4 h-4" strokeWidth={1.5} />;
    }
  };

  const TransactionCard = ({ transaction, isReceived = false }: { transaction: Transaction, isReceived?: boolean }) => {
    const daysLeft = daysUntilExpiry(transaction.expires_at);
    const isExpiringSoon = daysLeft <= 2;

    return (
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-white rounded-[1rem] border border-border overflow-hidden hover:shadow-md transition-shadow"
      >
        <div className="flex gap-4 p-4">
          <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            <ImageWithFallback
              src={transaction.product?.images[0] || ''}
              alt={transaction.product?.title || 'Product'}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-light text-black truncate">
                    {transaction.product?.title}
                  </h3>
                  <p className="text-sm font-light text-muted-foreground">
                    {isReceived ? `From: Anonymous` : transaction.shop?.business_name}
                  </p>
                </div>
                <Badge className={`${getStatusColor(transaction.status)} font-light flex items-center gap-1`}>
                  {getStatusIcon(transaction.status)}
                  {transaction.status}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                {!isReceived && (
                  <span className="text-lg font-medium bg-gradient-to-r from-[#F97316] to-[#FB923C] bg-clip-text text-transparent">
                    {formatZMW(transaction.amount_zmw)}
                  </span>
                )}
                <span className="text-xs font-light text-muted-foreground">
                  {formatRelativeTime(transaction.created_at)}
                </span>
              </div>
            </div>

            {/* Order Tracking Progress Bar */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                <span className={`font-medium ${transaction.status === 'in_escrow' || transaction.status === 'completed' ? 'text-[#F97316]' : ''}`}>Paid</span>
                <span className={`font-medium ${transaction.status === 'in_escrow' ? 'text-blue-500' : (transaction.status === 'completed' ? 'text-[#F97316]' : '')}`}>Awaiting Collection</span>
                <span className={`font-medium ${transaction.status === 'completed' ? 'text-green-500' : ''}`}>Claimed</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${
                  transaction.status === 'completed' ? 'w-full bg-green-500' 
                  : transaction.status === 'in_escrow' ? 'w-1/2 bg-blue-500' 
                  : 'w-1/4 bg-[#F97316]'
                }`}></div>
              </div>
            </div>

            {/* Claim Code (for active gifts) */}
            {transaction.status === 'in_escrow' && (
              <div className="space-y-2 mt-2">
                <div className="bg-gray-50 rounded-lg p-3 border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-light text-muted-foreground">
                      Claim Code
                    </span>
                    {isExpiringSoon && (
                      <Badge className="bg-red-100 text-red-700 font-light text-xs">
                        {daysLeft}d left
                      </Badge>
                    )}
                  </div>
                  <div className="text-xl font-mono tracking-wider">
                    {transaction.claim_code}
                  </div>
                </div>
                <button className="w-full py-2 bg-gradient-to-r from-[#F97316] to-[#FB923C] text-white rounded-full font-light text-sm">
                  Show QR Code
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Banner overlay */}
      <div className="h-32 bg-gradient-to-r from-[#F97316] to-[#FB923C]"></div>

      <div className="container mx-auto px-4 md:px-6 relative -top-16">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Sidebar / Profile Area */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="p-6 border-none shadow-sm text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center border-4 border-white shadow-sm overflow-hidden mx-auto">
                  {user?.full_name ? (
                    <span className="text-3xl font-light text-[#F97316]">{user.full_name.charAt(0)}</span>
                  ) : (
                    <User className="w-10 h-10 text-[#F97316]" strokeWidth={1.5} />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-border hover:bg-gray-50 transition-colors">
                  <Camera className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                </button>
              </div>
              <h2 className="text-xl font-light text-black">{user?.full_name || 'Guest User'}</h2>
              <p className="text-sm font-light text-muted-foreground mb-4">{user?.phone || '+260 970 000 000'}</p>
              
              <div className="flex justify-center gap-2">
                <Badge className="bg-gray-100 text-gray-700 font-light hover:bg-gray-200 cursor-pointer">
                  Edit Profile
                </Badge>
              </div>
            </Card>

            {/* Happiness Scorecard (Metrics) */}
            <Card className="p-6 border-none shadow-sm bg-gradient-to-br from-white to-orange-50">
              <div className="flex items-center gap-2 mb-4">
                <HeartHandshake className="w-5 h-5 text-[#F97316]" strokeWidth={1.5} />
                <h3 className="font-light text-black">Impact Score</h3>
              </div>
              
              <div className="space-y-6">
                <div className="text-center pb-4 border-b border-orange-100">
                  <p className="text-5xl font-light text-[#F97316] mb-1">8</p>
                  <p className="text-sm font-light text-muted-foreground">People Made Happy</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="flex justify-center mb-1"><Gift className="w-4 h-4 text-[#FB923C]" /></div>
                    <p className="text-2xl font-light">12</p>
                    <p className="text-xs font-light text-muted-foreground">Gifts Sent</p>
                  </div>
                  <div>
                    <div className="flex justify-center mb-1"><Smile className="w-4 h-4 text-[#FB923C]" /></div>
                    <p className="text-2xl font-light">4</p>
                    <p className="text-xs font-light text-muted-foreground">Gifts Received</p>
                  </div>
                </div>

                <div className="bg-white/60 rounded-lg p-3 text-center border border-orange-100">
                  <p className="text-xs font-light text-black flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#F97316]" /> You're in the top 10% of gifters!
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            <Tabs defaultValue="vault" className="space-y-6">
              <div className="bg-white p-2 rounded-xl border border-border shadow-sm overflow-x-auto">
                <TabsList className="bg-transparent border-none w-full flex justify-start gap-2 h-auto">
                  <TabsTrigger value="vault" className="data-[state=active]:bg-[#F97316] data-[state=active]:text-white rounded-lg px-6 py-2.5 font-light">
                    <Package className="w-4 h-4 mr-2" strokeWidth={1.5} /> Sent Gifts
                  </TabsTrigger>
                  <TabsTrigger value="received" className="data-[state=active]:bg-[#F97316] data-[state=active]:text-white rounded-lg px-6 py-2.5 font-light">
                    <Gift className="w-4 h-4 mr-2" strokeWidth={1.5} /> Received Gifts
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="data-[state=active]:bg-[#F97316] data-[state=active]:text-white rounded-lg px-6 py-2.5 font-light">
                    <Settings className="w-4 h-4 mr-2" strokeWidth={1.5} /> Settings
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="data-[state=active]:bg-[#F97316] data-[state=active]:text-white rounded-lg px-6 py-2.5 font-light">
                    <Bell className="w-4 h-4 mr-2" strokeWidth={1.5} /> Notifications
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Sent Gifts Vault */}
              <TabsContent value="vault" className="space-y-6">
                <Tabs defaultValue="active" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-light">Sent Gifts</h2>
                    <TabsList className="bg-white border border-border">
                      <TabsTrigger value="active" className="font-light">Active</TabsTrigger>
                      <TabsTrigger value="completed" className="font-light">Completed</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="active" className="space-y-4">
                    {sentActiveGifts.length > 0 ? (
                      sentActiveGifts.map(transaction => (
                        <TransactionCard key={transaction.id} transaction={transaction} />
                      ))
                    ) : (
                      <div className="text-center py-20 bg-white rounded-xl border border-border">
                        <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" strokeWidth={1.5} />
                        <h3 className="font-light text-black mb-2">No active gifts</h3>
                        <button className="mt-4 px-6 py-2 bg-gray-100 rounded-full font-light hover:bg-gray-200">Browse Shops</button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="completed" className="space-y-4">
                    {sentCompletedGifts.length > 0 ? (
                      sentCompletedGifts.map(transaction => (
                        <TransactionCard key={transaction.id} transaction={transaction} />
                      ))
                    ) : (
                      <div className="text-center py-20 bg-white rounded-xl border border-border">
                        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" strokeWidth={1.5} />
                        <h3 className="font-light text-black mb-2">No completed gifts</h3>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </TabsContent>

              {/* Received Space */}
              <TabsContent value="received" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-light">Received Gifts</h2>
                  <button className="text-[#F97316] text-sm font-light hover:underline flex items-center gap-1">
                    <Clock className="w-4 h-4" /> History
                  </button>
                </div>

                {receivedGifts.length > 0 ? (
                  receivedGifts.map(transaction => (
                    <TransactionCard key={transaction.id} transaction={transaction} isReceived={true} />
                  ))
                ) : (
                  <div className="text-center py-20 bg-white rounded-xl border border-border">
                    <Gift className="w-16 h-16 mx-auto mb-4 text-muted-foreground" strokeWidth={1.5} />
                    <h3 className="font-light text-black mb-2">You haven't received any gifts yet.</h3>
                  </div>
                )}
              </TabsContent>

              {/* Settings Space */}
              <TabsContent value="settings" className="space-y-6">
                <h2 className="text-lg font-light mb-4">Account Settings</h2>
                
                <Card className="p-6 border-none shadow-sm space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Profile Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-light text-muted-foreground">Full Name</label>
                        <input 
                          type="text" 
                          value={profileForm.fullName}
                          onChange={e => setProfileForm({...profileForm, fullName: e.target.value})}
                          className="w-full px-4 py-2 mt-1 border border-border rounded-lg bg-gray-50 focus:bg-white focus:outline-none" 
                        />
                      </div>
                      <div>
                        <label className="text-xs font-light text-muted-foreground">Email Address</label>
                        <input 
                          type="email" 
                          value={profileForm.email}
                          onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                          className="w-full px-4 py-2 mt-1 border border-border rounded-lg bg-gray-50 focus:bg-white focus:outline-none" 
                        />
                      </div>
                      <div>
                        <label className="text-xs font-light text-muted-foreground">Phone Number</label>
                        <input 
                          type="tel" 
                          value={profileForm.phone}
                          onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                          className="w-full px-4 py-2 mt-1 border border-border rounded-lg bg-gray-50 focus:bg-white focus:outline-none" 
                        />
                      </div>
                      <button onClick={handleProfileSave} className="px-6 py-2 bg-slate-900 text-white rounded-lg font-light text-sm">Save Profile</button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <h3 className="font-medium mb-3">Security</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-light text-sm">Password</p>
                          <p className="text-xs text-muted-foreground">Last changed 3 months ago</p>
                        </div>
                        <button className="text-sm text-[#F97316] font-light hover:underline">Update</button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <h3 className="font-medium mb-3">Payment Methods</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-6 bg-red-500 rounded flex items-center justify-center text-white text-[10px] font-bold tracking-wider">AIRTEL</div>
                          <div>
                            <p className="font-light text-sm">Airtel Money</p>
                            <p className="text-xs text-muted-foreground">*** *** 1234</p>
                          </div>
                        </div>
                        <button className="text-sm font-light hover:text-red-500 hover:underline transition-colors">Remove</button>
                      </div>
                      <button className="text-sm text-[#F97316] font-light hover:underline">+ Add New Payment Method</button>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Notifications Space */}
              <TabsContent value="notifications" className="space-y-6">
                <h2 className="text-lg font-light mb-4">Notification Preferences</h2>
                <Card className="p-6 border-none shadow-sm">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-light">Gift Received Alerts</p>
                        <p className="text-xs text-muted-foreground">When someone sends you a gift</p>
                      </div>
                      <div className="w-12 h-6 bg-[#F97316] rounded-full relative cursor-pointer">
                        <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-light">Claim Code Expiring</p>
                        <p className="text-xs text-muted-foreground">When a sent gift is about to expire</p>
                      </div>
                      <div className="w-12 h-6 bg-[#F97316] rounded-full relative cursor-pointer">
                        <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-light">Promotions & Offers</p>
                        <p className="text-xs text-muted-foreground">Special deals from local shops</p>
                      </div>
                      <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                        <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1"></div>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}