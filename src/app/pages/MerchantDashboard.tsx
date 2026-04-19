// KithLy Merchant Dashboard - Unified interface

import React, { useState } from 'react';
import { Store, TrendingUp, Clock, Package, Megaphone, Settings, Plus, QrCode, BarChart } from 'lucide-react';
import { HandshakeTerminal } from '../components/shared/HandshakeTerminal';
import { mockTransactions, mockProducts, mockShops } from '../data/mock-data';
import { formatZMW, formatRelativeTime } from '../utils/formatters';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { ProductModal } from '../components/shared/ProductModal';
import { AdCampaignModal } from '../components/shared/AdCampaignModal';
import type { Product, ProductCategory } from '../types';
import { toast } from 'sonner';
import { postJson } from '../lib/api';
import { pushNotification } from '../lib/notifications';

const MERCHANT_SHOP_ID = 'shop-1';

export function MerchantDashboard() {
  const merchantShop = mockShops.find((s) => s.id === MERCHANT_SHOP_ID)!;

  const [recentRedemptions, setRecentRedemptions] = useState(
    mockTransactions.filter((t) => t.status === 'completed')
  );

  const [inventoryProducts, setInventoryProducts] = useState<Product[]>(() =>
    mockProducts.filter((p) => p.shop_id === MERCHANT_SHOP_ID)
  );

  const [shopSettings, setShopSettings] = useState({
    businessName: merchantShop.business_name,
    locationLabel:
      [merchantShop.district?.name, merchantShop.district?.province].filter(Boolean).join(', ') ||
      'Lusaka, Zambia',
  });

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleProductSave = (data: Partial<Product>) => {
    const isEdit = Boolean(data.id);
    setInventoryProducts((prev) => {
      const existingId = data.id;
      if (existingId && prev.some((p) => p.id === existingId)) {
        return prev.map((p) =>
          p.id === existingId
            ? ({
                ...p,
                ...data,
                shop_id: MERCHANT_SHOP_ID,
                shop: merchantShop,
              } as Product)
            : p
        );
      }
      const category = (data.category ?? 'other') as ProductCategory;
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        shop_id: MERCHANT_SHOP_ID,
        shop: merchantShop,
        title: data.title ?? 'New product',
        description: data.description ?? '',
        price_zmw: data.price_zmw ?? 0,
        stock_count: data.stock_count ?? 0,
        category,
        images: data.images?.length
          ? data.images
          : [
              'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80&auto=format&fit=crop',
            ],
        featured: data.featured ?? false,
        created_at: new Date().toISOString(),
      };
      return [...prev, newProduct];
    });
    toast.success(isEdit ? 'Product updated' : 'Product added', {
      description: data.title ?? '',
    });
  };

  const handleSettingsSave = () => {
    toast.success('Shop profile updated', {
      description: `${shopSettings.businessName} · ${shopSettings.locationLabel}`,
    });
  };

  const handleVerifyCode = async (code: string): Promise<boolean> => {
    try {
      const { ok, status, data } = await postJson<{ ok?: boolean; error?: string }>(
        '/api/handshake/verify',
        { code }
      );
      if (status === 429) {
        toast.error('Too many attempts', {
          description: data?.error ?? 'Try again in a minute.',
        });
        return false;
      }
      if (ok && data?.ok) {
        toast.success('Gift successfully verified and claimed!');
        setRecentRedemptions((prev) => [mockTransactions[0], ...prev]);
        pushNotification({
          type: 'success',
          title: 'Gift Claimed',
          message: `Your gift was just claimed in Garden!`,
          audience: 'buyer',
        });
        pushNotification({
          type: 'info',
          title: 'Escrow Released',
          message: `Claim completed for ${mockTransactions[0].product?.title ?? 'gift'}.`,
          audience: 'merchant',
        });
        return true;
      }
      toast.error(data?.error ?? 'Invalid or expired code.');
      return false;
    } catch {
      toast.error('Verification failed', {
        description: 'Check your connection and try again.',
      });
      return false;
    }
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
            <button
              onClick={() => {
                setSelectedProduct(null);
                setIsProductModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-light hover:bg-slate-800 transition-colors"
            >
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
                  {inventoryProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-full h-full p-2 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-black">{product.title}</span>
                          <span className="text-xs text-muted-foreground truncate w-32 md:w-48">{product.description}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{formatZMW(product.price_zmw)}</td>
                      <td className="px-6 py-4">
                        <Badge
                          className={`${
                            product.stock_count > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          } border-none font-light`}
                        >
                          {product.stock_count > 0 ? `In Stock (${product.stock_count})` : 'Out of Stock'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsProductModalOpen(true);
                          }}
                          className="text-muted-foreground hover:text-black transition-colors"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ADS & PROMOS */}
        <TabsContent value="promos" className="mt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-xl font-light text-black">Active Campaigns</h2>
              <p className="text-sm font-light text-muted-foreground">Manage your promoted listings and shop ads</p>
            </div>
            <button
              type="button"
              onClick={() => setIsAdModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#F97316] to-[#FB923C] text-white rounded-xl font-light hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" /> Create Ad Campaign
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="p-6 border-none shadow-sm flex flex-col justify-between min-h-[200px]">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <Badge className="bg-green-100 text-green-700 border-none font-light">Active</Badge>
                  <span className="text-xs text-muted-foreground font-light">Ends in 3 days</span>
                </div>
                <h3 className="font-medium text-black text-lg">Summer Sale Spotlight</h3>
                <p className="text-sm font-light text-muted-foreground mt-1">
                  Featured placement in &quot;Discover More&quot; feed
                </p>
              </div>
              <div className="mt-6 flex justify-between items-end">
                <div>
                  <span className="text-2xl font-light text-black">1.2k</span>
                  <p className="text-xs text-muted-foreground font-light">Impressions</p>
                </div>
                <div>
                  <span className="text-2xl font-light text-black">84</span>
                  <p className="text-xs text-muted-foreground font-light">Clicks</p>
                </div>
              </div>
            </Card>

            <button
              type="button"
              onClick={() => setIsAdModalOpen(true)}
              className="text-left rounded-[inherit]"
            >
              <Card className="p-6 border-dashed border-2 bg-transparent shadow-none flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#F97316] transition-colors min-h-[200px]">
                <Megaphone className="w-8 h-8 mb-3 text-muted-foreground" strokeWidth={1.5} />
                <h3 className="font-light text-black">Boost your next product</h3>
                <p className="text-sm text-muted-foreground font-light max-w-xs mt-1">
                  Get more eyes on your shop by running targeted promotions.
                </p>
              </Card>
            </button>
          </div>
        </TabsContent>

        {/* ANALYTICS */}
        <TabsContent value="analytics" className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-light text-black">Sales Analytics</h2>
              <p className="text-sm font-light text-muted-foreground">Monitor your shop&apos;s performance</p>
            </div>
            <select className="px-4 py-2 bg-white border border-border rounded-xl font-light text-sm outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Year</option>
            </select>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <Card className="p-6 border-none shadow-sm">
              <h3 className="text-sm font-light text-muted-foreground mb-1">Total Revenue</h3>
              <p className="text-2xl font-light text-black">{formatZMW(12500)}</p>
              <div className="mt-4 flex items-center text-xs text-green-600 font-light">
                <TrendingUp className="w-3 h-3 mr-1" /> +14.5% from last period
              </div>
            </Card>
            <Card className="p-6 border-none shadow-sm">
              <h3 className="text-sm font-light text-muted-foreground mb-1">Items Sold</h3>
              <p className="text-2xl font-light text-black">48</p>
              <div className="mt-4 flex items-center text-xs text-green-600 font-light">
                <TrendingUp className="w-3 h-3 mr-1" /> +5.2% from last period
              </div>
            </Card>
            <Card className="p-6 border-none shadow-sm">
              <h3 className="text-sm font-light text-muted-foreground mb-1">Store Views</h3>
              <p className="text-2xl font-light text-black">3,240</p>
              <div className="mt-4 flex items-center text-xs text-green-600 font-light">
                <TrendingUp className="w-3 h-3 mr-1" /> +22.8% from last period
              </div>
            </Card>
          </div>

          <Card className="p-8 border-none shadow-sm flex items-center justify-center min-h-[300px]">
            <div className="text-center">
              <BarChart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" strokeWidth={1.5} />
              <h3 className="text-lg font-light text-black mb-2">Revenue Overview Chart</h3>
              <p className="text-sm font-light text-muted-foreground max-w-sm mx-auto">
                Interactive charts will be available in the next release to give you detailed visual breakdowns of your
                historical sales data.
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
                <label className="text-xs font-light text-muted-foreground" htmlFor="shop-business-name">
                  Business Name
                </label>
                <input
                  id="shop-business-name"
                  type="text"
                  value={shopSettings.businessName}
                  onChange={(e) => setShopSettings((s) => ({ ...s, businessName: e.target.value }))}
                  className="w-full px-4 py-2 mt-1 border border-border rounded-lg bg-gray-50 focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-light text-muted-foreground" htmlFor="shop-location">
                  Location
                </label>
                <input
                  id="shop-location"
                  type="text"
                  value={shopSettings.locationLabel}
                  onChange={(e) => setShopSettings((s) => ({ ...s, locationLabel: e.target.value }))}
                  className="w-full px-4 py-2 mt-1 border border-border rounded-lg bg-gray-50 focus:bg-white focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleSettingsSave}
                className="px-6 py-2 bg-slate-900 text-white rounded-lg font-light text-sm"
              >
                Save Changes
              </button>
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
              <button type="button" className="text-sm text-[#F97316] font-light hover:underline">
                Manage
              </button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={selectedProduct}
        onSave={handleProductSave}
      />

      <AdCampaignModal isOpen={isAdModalOpen} onClose={() => setIsAdModalOpen(false)} />
    </div>
  );
}
