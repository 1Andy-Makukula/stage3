import { createContext, useContext, useState, ReactNode } from 'react';

type PricingMode = 'currency' | 'equivalent';

interface PricingContextType {
  mode: PricingMode;
  toggleMode: () => void;
  formatPrice: (amount: number) => string;
}

const PricingContext = createContext<PricingContextType | undefined>(undefined);

export function PricingProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PricingMode>('currency');

  const toggleMode = () => setMode((prev) => (prev === 'currency' ? 'equivalent' : 'currency'));

  const formatPrice = (amount: number) => {
    if (mode === 'currency') {
      return `ZMW ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
    }
    
    // Emotional Equivalent Logic
    if (amount >= 500) return `≈ ${Math.floor(amount / 500)} Bags of Rice`;
    if (amount >= 300) return `≈ ${Math.floor(amount / 300)} Bags of Mealie Meal`;
    if (amount >= 150) return `≈ ${Math.floor(amount / 150)} Bottles of Oil`;
    if (amount >= 50)  return `≈ ${Math.floor(amount / 50)} Trays of Eggs`;
    if (amount >= 20)  return `≈ ${Math.floor(amount / 20)} Loaves of Bread`;
    return 'Small treat';
  };

  return (
    <PricingContext.Provider value={{ mode, toggleMode, formatPrice }}>
      {children}
    </PricingContext.Provider>
  );
}

export function usePricing() {
  const context = useContext(PricingContext);
  if (context === undefined) {
    throw new Error('usePricing must be used within a PricingProvider');
  }
  return context;
}
