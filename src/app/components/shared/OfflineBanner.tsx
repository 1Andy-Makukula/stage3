import { WifiOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-red-500 text-white w-full overflow-hidden"
        >
          <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-sm font-light">
              You are currently offline. Some features may be unavailable.
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
