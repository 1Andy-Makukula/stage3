// KithLy Merchant Dashboard - Unified interface

import { useState } from 'react';
import { Store, TrendingUp, Clock, Package, Megaphone, Settings, Plus, QrCode } from 'lucide-react';
import { HandshakeTerminal } from '../components/shared/HandshakeTerminal';
import { mockTransactions } from '../data/mock-data';
import { formatZMW, formatRelativeTime } from '../utils/formatters';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';

export function MerchantDashboard() {
  const [recentRedemptions, setRecentRedemptions] = useState(
    mockTransactions.filter(t => t.status === 'completed')
  );

  const handleVerifyCode = async (code: string): Promise<boolean> => {
    // Mock verification
    await new Promise(resolve => setTimeout(resolve, 1500));
    const success = Math.random() > 0.2;
    if (success) {
      setRecentRedemptions(prev => [mockTransactions[0], ...prev]);
    }
    return success;
  };

  const todayEarnings = recentRedemptions.reduce((sum, t) => sum + t.amount_zmw, 0);

  return (
    <div className="w-full">
      <Tabs defaultValue="terminal" className="space-y-6">
        <TabsList className="bg-white border border-border p-1 w-full justify-start h-auto rounded-xl">
          <TabsTrigger value="terminal" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-lg px-4 py-2 font-light">
            <QrCode className="w-4 h-4 mr-2" strokeWidth={1.5} /> Terminal
          </TabsTrigger>
          <TabsTrigger value="inventory" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-lg px-4 py-2 font-light">
            <Package className="w-4 h-4 mr-2" strokeWidth={1.5} /> Inventory
          </TabsTrigger>
          <TabsTrigger value="promos" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-lg px-4 py-2 font-light">
            <Megaphone className="w-4 h-4 mr-2" strokeWidth={1.5} /> Ads & Promos
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-lg px-4 py-2 font-light">
            <TrendingUp className="w-4 h-4 mr-2" strokeWidth={1.5} /> Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-lg px-4 py-2 font-light">
            <Settings className="w-4 h-4 mr-2" strokeWidth={1.5} /> Settings
          </TabsTrigger>
        </TabsList>

        {/* TERMINAL */}
        <TabsContent value="terminal" className="mt-6">
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <Card className="p-8 border-none shadow-sm">
                <HandshakeTerminal mode="merchant" onVerify={handleVerifyCode} />
              </Card>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <Card className="p-4 border-none shadow-sm flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-[#F97316]" strokeWidth={1.5} />
                    <span className="text-xs font-light text-muted-foreground">Today's Volume</span>
                  </div>
                  <p className="text-2xl font-light bg-gradient-to-r from-[#F97316] to-[#FB923C] bg-clip-text text-transparent">
                    {formatZMW(todayEarnings)}
                  </p>
                </Card>
                <Card className="p-4 border-none shadow-sm flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-[#F97316]" strokeWidth={1.5} />
                    <span className="text-xs font-light text-muted-foreground">Redemptions</span>
                  </div>
                  <p className="text-2xl font-light text-black">{recentRedemptions.length}</p>
                </Card>
              </div>
            </div>

            <div>
              <h2 className="font-light text-black mb-4">Recent Redemptions</h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {recentRedemptions.length > 0 ? (
                  recentRedemptions.map((transaction) => (
                    <Card key={transaction.id} className="p-4 border-none shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-light text-black truncate">{transaction.product?.title}</h3>
                          <p className="text-sm font-light text-muted-foreground">Code: {transaction.claim_code}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-medium text-[#F97316]">{formatZMW(transaction.amount_zmw)}</p>
                          <p className="text-xs font-light text-muted-foreground">
                            {formatRelativeTime(transaction.completed_at || transaction.created_at)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 mx-auto mb-3 text-muted-foreground" strokeWidth={1.5} />
                    <p className="font-light text-muted-foreground">No redemptions yet today</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* INVENTORY */}
        <TabsContent value="inventory" className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-light text-black">Inventory Management</h2>
              <p className="text-sm font-light text-muted-foreground">Manage your product listings</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-light hover:bg-slate-800 transition-colors">
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>
          
          <Card className="p-0 border-none shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-light">
                <thead className="bg-gray-50 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-medium">Product Name</th>
                    <th className="px-6 py-4 font-medium">Price</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg"></div>
                      Zambezi Gift Basket
                    </td>
                    <td className="px-6 py-4">{formatZMW(450)}</td>
                    <td className="px-6 py-4"><Badge className="bg-green-100 text-green-700">Active</Badge></td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-muted-foreground hover:text-black">Edit</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ADS & PROMOS */}
        <TabsContent value="promos" className="mt-6">
          <Card className="p-8 border-none shadow-sm text-center">
            <Megaphone className="w-12 h-12 mx-auto mb-4 text-[#F97316]" strokeWidth={1.5} />
            <h2 className="text-xl font-light text-black mb-2">Promote Your Shop</h2>
            <p className="text-sm font-light text-muted-foreground max-w-md mx-auto mb-6">
              Boost your visibility in the "Discover More" feed with dynamic ads.
            </p>
            <button className="px-6 py-2 bg-gradient-to-r from-[#F97316] to-[#FB923C] text-white rounded-full font-light">
              Create Ad Campaign
            </button>
          </Card>
        </TabsContent>

        {/* ANALYTICS */}
        <TabsContent value="analytics" className="mt-6">
           <Card className="p-8 border-none shadow-sm flex items-center justify-center min-h-[300px]">
            <div className="text-center">
              <BarChart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" strokeWidth={1.5} />
              <h2 className="text-xl font-light text-black mb-2">Sales Analytics</h2>
              <p className="text-sm font-light text-muted-foreground">
                Detailed breakdowns of your historical sales data.
              </p>
            </div>
          </Card>
        </TabsContent>

        {/* SETTINGS */}
        <TabsContent value="settings" className="mt-6">
          <Card className="p-6 border-none shadow-sm max-w-2xl">
            <h3 className="font-medium mb-4">Shop Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-light text-muted-foreground">Business Name</label>
                <input type="text" defaultValue="My KithLy Shop" className="w-full px-4 py-2 mt-1 border border-border rounded-lg bg-gray-50 focus:bg-white focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-light text-muted-foreground">Location</label>
                <input type="text" defaultValue="Lusaka, Zambia" className="w-full px-4 py-2 mt-1 border border-border rounded-lg bg-gray-50 focus:bg-white focus:outline-none" />
              </div>
              <button className="px-6 py-2 bg-slate-900 text-white rounded-lg font-light text-sm">Save Changes</button>
            </div>
            
            <hr className="my-8 border-border" />
            
            <h3 className="font-medium mb-4">Payout Connection</h3>
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <Store className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-light text-sm">MTN Merchant MoMo</p>
                  <p className="text-xs text-muted-foreground">Connected • Auto-payouts enabled</p>
                </div>
              </div>
              <button className="text-sm text-[#F97316] font-light hover:underline">Manage</button>
            </div>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
