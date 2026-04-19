import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { Sparkles, TrendingUp, MapPin, Search } from 'lucide-react';
import { HeroSlider } from '../components/shared/HeroSlider';
import { HorizontalProductRibbon } from '../components/shared/HorizontalProductRibbon';
import { ProductCard } from '../components/shared/ProductCard';
import { Skeleton } from '../components/ui/skeleton';
import { heroSlides, mockProducts, districts } from '../data/mock-data';
import type { Product } from '../types';

export function LandingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q');

  const filteredProducts = mockProducts.filter(p => {
    const matchesDistrict = selectedDistrict ? p.shop?.district_id === selectedDistrict : true;
    const matchesSearch = searchQuery 
      ? p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesDistrict && matchesSearch;
  });

  const featuredProducts = filteredProducts.filter(p => p.featured);
  const foodProducts = filteredProducts.filter(p => p.category === 'food');
  const giftProducts = filteredProducts.filter(p => p.category === 'gifts');
  const electronicsProducts = filteredProducts.filter(p => p.category === 'electronics');

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!searchQuery && (
        <section className="container mx-auto px-4 md:px-6 py-6">
          <HeroSlider slides={heroSlides} />
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
            onProductClick={handleProductClick}
          />

          <HorizontalProductRibbon
            title="Popular in Garden"
            subtitle="Trending near you"
            products={mockProducts.filter(p => p.shop?.district?.name === 'Garden')}
            onProductClick={handleProductClick}
          />

          <HorizontalProductRibbon
            title="Food & Grocery"
            subtitle="Fresh from local shops"
            products={foodProducts}
            onProductClick={handleProductClick}
          />

          <HorizontalProductRibbon
            title="Gift Cards"
            subtitle="Perfect for any occasion"
            products={giftProducts}
            onProductClick={handleProductClick}
          />

          <HorizontalProductRibbon
            title="Electronics"
            subtitle="Latest gadgets and tech"
            products={electronicsProducts}
            onProductClick={handleProductClick}
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
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-[1rem]" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <div key={product.id}>
                <ProductCard
                  product={product}
                  onClick={() => handleProductClick(product)}
                />
                
                {/* Interstitial Ad Card every 6 products (only on discover view) */}
                {!searchQuery && (index + 1) % 6 === 0 && (
                  <div className="col-span-2 md:col-span-3 lg:col-span-4 my-6">
                    <div className="bg-gradient-to-r from-[#F97316] to-[#FB923C] rounded-[1rem] p-8 text-white text-center">
                      <Sparkles className="w-12 h-12 mx-auto mb-4" strokeWidth={1.5} />
                      <h3 className="text-2xl font-light mb-2">
                        Shop of the Week
                      </h3>
                      <p className="font-light text-white/90">
                        Exclusive deals from verified merchants
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
             <div className="col-span-full py-20 text-center">
               <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" strokeWidth={1.5} />
               <p className="font-light text-black text-lg">No products found</p>
               <p className="text-sm text-muted-foreground font-light mb-6">Try searching for something else or clear your filters.</p>
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

      {mockProducts.length === 0 && (
        <div className="container mx-auto px-4 md:px-6 py-20 text-center">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground" strokeWidth={1.5} />
          <h3 className="font-light text-black mb-2">
            No shops in your district yet
          </h3>
          <p className="text-sm font-light text-muted-foreground mb-6">
            Check out these national favorites instead
          </p>
          <button className="px-6 py-3 bg-gradient-to-r from-[#F97316] to-[#FB923C] text-white rounded-full font-light">
            Browse All Shops
          </button>
        </div>
      )}
    </div>
  );
}
