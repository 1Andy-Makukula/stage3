import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Sparkles, TrendingUp, MapPin, Search } from 'lucide-react';
import { HeroSlider } from '../components/shared/HeroSlider';
import { HorizontalProductRibbon } from '../components/shared/HorizontalProductRibbon';
import { ProductCard } from '../components/shared/ProductCard';
import { ProductCardSkeleton } from '../components/shared/ProductCardSkeleton';
import { ErrorBoundary } from '../components/shared/ErrorBoundary';
import { EmptyState } from '../components/shared/EmptyState';
import { heroSlides, districts } from '../data/mock-data';
import { useProducts } from '../hooks/useProducts';
import { useAds } from '../hooks/useAds';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Megaphone } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();
  const { products, loading: productsLoading } = useProducts();
  const { globalAlert, featuredRibbon } = useAds();
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q');

  const marketLoading = productsLoading;

  const filteredProducts = products.filter(p => {
    const matchesDistrict = selectedDistrict ? p.shop?.district_id === selectedDistrict : true;
    const matchesSearch = searchQuery 
      ? p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesDistrict && matchesSearch;
  });

  const featuredProducts = filteredProducts.filter(p => p.featured);
  const foodProducts = filteredProducts.filter(p => p.category === 'food');
  const giftProducts = filteredProducts.filter(p => p.category === 'gifts');
  const electronicsProducts = filteredProducts.filter(p => p.category === 'electronics');
  const apologyProducts = filteredProducts.filter((p) => p.category === 'food' || p.category === 'gifts');
  const monthEndProducts = filteredProducts.filter((p) => p.price_zmw <= 250);
  const justBecauseProducts = filteredProducts.filter((p) => p.featured || p.category === 'gifts');
  const selfPickupProducts = filteredProducts.filter((p) => p.category === 'food' || p.category === 'electronics');

  const ribbonBusy = !searchQuery && marketLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* KGCC: Global Platform Alert */}
      {globalAlert && (
        <div className="bg-[#F97316] text-white py-2 px-4 text-center flex items-center justify-center gap-3">
          <Megaphone className="w-4 h-4 animate-pulse" />
          <span className="text-sm font-light uppercase tracking-widest">{globalAlert.content_json.hero_title || 'System Announcement'}</span>
          <span className="text-sm font-medium">{globalAlert.content_json.hero_subtitle}</span>
        </div>
      )}

      {!searchQuery && (
        <section className="container mx-auto px-4 md:px-6 py-6">
          <Tabs defaultValue="apologies" className="mb-5">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full bg-white border border-border rounded-xl p-1 h-auto gap-1">
              <TabsTrigger value="apologies" className="font-light">Emergency Apologies</TabsTrigger>
              <TabsTrigger value="month-end" className="font-light">Month-End Care Packages</TabsTrigger>
              <TabsTrigger value="just-because" className="font-light">Just Because</TabsTrigger>
              <TabsTrigger value="self-pickup" className="font-light">Self-Pickup</TabsTrigger>
            </TabsList>
            <TabsContent value="apologies" className="mt-4">
              <HorizontalProductRibbon
                title="Emergency Apologies"
                subtitle="Fast wins when words are not enough"
                products={apologyProducts}
                loading={ribbonBusy}
              />
            </TabsContent>
            <TabsContent value="month-end" className="mt-4">
              <HorizontalProductRibbon
                title="Month-End Care Packages"
                subtitle="Affordable bundles to keep loved ones going"
                products={monthEndProducts}
                loading={ribbonBusy}
              />
            </TabsContent>
            <TabsContent value="just-because" className="mt-4">
              <HorizontalProductRibbon
                title="Just Because"
                subtitle="Send warmth without waiting for an event"
                products={justBecauseProducts}
                loading={ribbonBusy}
              />
            </TabsContent>
            <TabsContent value="self-pickup" className="mt-4">
              <HorizontalProductRibbon
                title="Self-Pickup"
                subtitle="Reserve now, collect when it suits you"
                products={selfPickupProducts}
                loading={ribbonBusy}
              />
            </TabsContent>
          </Tabs>

          <ErrorBoundary fallbackTitle="Promotions could not load.">
            <HeroSlider slides={heroSlides} />
          </ErrorBoundary>
        </section>
      )}

      <section className={`container mx-auto px-4 md:px-6 mb-6 ${searchQuery ? 'pt-8' : ''}`}>
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-4 py-2 bg-white border border-border rounded-full font-light focus:outline-none focus:border-[#F97316]"
          >
            <option value="">All Districts</option>
            {districts.map(d => (
              <option key={d.id} value={d.id}>{d.name}, {d.province}</option>
            ))}
          </select>
          {selectedDistrict && (
            <button
              onClick={() => setSelectedDistrict('')}
              className="text-sm font-light text-[#F97316] hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>
      </section>

      {!searchQuery && (
        <>
          <HorizontalProductRibbon
            title="Featured Gifts"
            subtitle="Handpicked for you"
            products={featuredProducts}
            loading={ribbonBusy}
          />
          <section className="w-full my-8">
            <div className="relative h-[280px] md:h-[360px] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=80"
                alt="Friends sharing food together"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/20 flex items-end md:items-center">
                <div className="container mx-auto px-4 md:px-6 pb-8 md:pb-0">
                  <h3 className="text-3xl md:text-5xl font-semibold text-white max-w-3xl leading-tight">
                    Distance should not stop you from buying them lunch.
                  </h3>
                </div>
              </div>
            </div>
          </section>

          <HorizontalProductRibbon
            title="Popular Products"
            subtitle="Trending near you"
            products={filteredProducts.slice(0, 4)}
            loading={ribbonBusy}
          />

          <HorizontalProductRibbon
            title="Food & Grocery"
            subtitle="Fresh from local shops"
            products={foodProducts}
            loading={ribbonBusy}
          />

          <HorizontalProductRibbon
            title="Gift Cards"
            subtitle="Perfect for any occasion"
            products={giftProducts}
            loading={ribbonBusy}
          />
          <section className="w-full my-8">
            <div className="relative h-[280px] md:h-[360px] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1600&q=80"
                alt="Family sharing a happy meal"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/20 flex items-end md:items-center">
                <div className="container mx-auto px-4 md:px-6 pb-8 md:pb-0">
                  <h3 className="text-3xl md:text-5xl font-semibold text-white max-w-3xl leading-tight">
                    Secure the bag. Share the bread.
                  </h3>
                </div>
              </div>
            </div>
          </section>

          <HorizontalProductRibbon
            title="Electronics"
            subtitle="Latest gadgets and tech"
            products={electronicsProducts}
            loading={ribbonBusy}
          />
        </>
      )}

      <section className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center gap-2 mb-6">
          {searchQuery ? (
            <>
              <Search className="w-5 h-5 text-[#F97316]" strokeWidth={1.5} />
              <h2 className="font-light text-black text-xl">Search results for "{searchQuery}"</h2>
            </>
          ) : (
            <>
              <TrendingUp className="w-5 h-5 text-[#F97316]" strokeWidth={1.5} />
              <h2 className="font-light text-black">Discover More</h2>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {marketLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={`grid-sk-${i}`} />
            ))
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <div key={product.id}>
                <ProductCard product={product} />
                
                {!searchQuery && (index + 1) % 6 === 0 && (
                  <div className="col-span-2 md:col-span-3 lg:col-span-4 my-6">
                    <div 
                      className="rounded-[2.5rem] p-12 text-white text-center relative overflow-hidden group transition-all hover:shadow-2xl"
                      style={{ backgroundColor: featuredRibbon?.content_json.accent_color || '#F97316' }}
                    >
                      <Sparkles className="w-12 h-12 mx-auto mb-6 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                      <h3 className="text-3xl font-light mb-3 tracking-tight">
                        {featuredRibbon?.content_json.hero_title || 'Shop of the Week'}
                      </h3>
                      <p className="font-light text-white/90 text-lg mb-8">
                        {featuredRibbon?.content_json.hero_subtitle || 'Exclusive deals from verified merchants'}
                      </p>
                      {featuredRibbon?.content_json.cta_link && (
                        <Button 
                          onClick={() => navigate(featuredRibbon.content_json.cta_link!)}
                          className="rounded-full bg-white text-black hover:bg-zinc-100 px-10 h-12 font-medium"
                        >
                          {featuredRibbon.content_json.cta_text || 'Explore Shop'}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full">
              <EmptyState
                icon={Search}
                title="No gifts found"
                description="No gifts available in this district yet. Be the first to open a shop!"
                action={{
                  label: 'Apply as Merchant',
                  onClick: () => navigate('/merchant/apply'),
                }}
              />
            </div>
          )}
        </div>

        {filteredProducts.length > 0 && (
          <div className="mt-12 text-center">
            <button className="px-8 py-3 border border-border rounded-full hover:bg-gray-100 transition-colors font-light">
              Load More Products
            </button>
          </div>
        )}
      </section>

      {products.length === 0 && (
        <div className="container mx-auto px-4 md:px-6">
          <EmptyState
            icon={MapPin}
            title="No gifts available yet"
            description="No gifts available in this district yet. Be the first to open a shop!"
            action={{
              label: 'Become a Merchant',
              onClick: () => navigate('/merchant/apply'),
            }}
          />
        </div>
      )}
    </div>
  );
}
