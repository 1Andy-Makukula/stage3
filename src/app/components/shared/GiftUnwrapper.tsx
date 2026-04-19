import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles } from 'lucide-react';
import { QRCodeDisplay } from './QRCodeDisplay';

interface GiftUnwrapperProps {
  claimCode: string;
  senderName: string;
  giftMessage?: string;
}

export function GiftUnwrapper({ claimCode, senderName, giftMessage }: GiftUnwrapperProps) {
  const [opened, setOpened] = useState(false);

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.button
            key="sealed"
            type="button"
            onClick={() => setOpened(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-8 text-center"
          >
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, -2, 2, 0] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-sm"
            >
              <Gift className="h-8 w-8" />
            </motion.div>
            <p className="text-lg font-medium text-slate-900">Tap to unwrap your gift</p>
            <p className="mt-1 text-sm font-light text-slate-500">Reveal your QR code and message</p>
          </motion.button>
        ) : (
          <motion.div
            key="opened"
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            className="space-y-4 rounded-2xl bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-center gap-2 text-orange-500">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Unwrapped</span>
            </div>
            <QRCodeDisplay value={claimCode} size={180} />
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-left">
              <p className="text-xs font-light text-slate-500">From</p>
              <p className="font-medium text-slate-900">{senderName}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-left">
              <p className="text-xs font-light text-slate-500">Gift message</p>
              <p className="font-light text-slate-800">{giftMessage || 'Enjoy your gift from KithLy.'}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
