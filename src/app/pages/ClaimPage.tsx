import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Copy, ArrowLeft, Heart, CheckCircle2, MessageCircleHeart } from 'lucide-react';
import { mockTransactions } from '../data/mock-data';
import { formatZMW } from '../utils/formatters';
import { toast, Toaster } from 'sonner';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';

const THANK_YOU_REACTIONS = [
  { emoji: "🥳", text: "Party time!" },
  { emoji: "❤️", text: "Love it!" },
  { emoji: "😂", text: "Haha awesome!" },
  { emoji: "🥺", text: "So sweet!" },
  { emoji: "🔥", text: "This is fire" },
  { emoji: "🙏", text: "Bless you!" },
];

export function ClaimPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [reactionSent, setReactionSent] = useState(false);
  const [activeReaction, setActiveReaction] = useState('');

  // Find the transaction by ID, or fallback to the first open one
  const transaction = mockTransactions.find(t => t.id === id || t.claim_code === id) || mockTransactions[0];
  const { product, shop, claim_code, buyer } = transaction;

  useEffect(() => {
    // Generate QR Code
    if (claim_code) {
      QRCode.toDataURL(claim_code, {
        width: 200,
        margin: 2,
        color: {
          dark: '#0f172a',    // slate-900
          light: '#ffffff'    // white
        }
      }).then((url: string) => {
        setQrCodeDataUrl(url);
      }).catch((err: Error) => {
        console.error(err);
      });
    }

    // Trigger Confetti purely for visual WOW factor for user
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#F97316', '#FB923C', '#0f172a']
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#F97316', '#FB923C', '#0f172a']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [claim_code]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(claim_code);
    toast.success("Code copied to clipboard!");
  };

  const handleSendReaction = (emoji: string) => {
    setActiveReaction(emoji);
    
    // Simulate network request
    setTimeout(() => {
      setReactionSent(true);
      toast.success("Reaction sent to sender!");
      
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
    }, 600);
  };

  if (!product || !shop) {
    return <div className="min-h-screen flex items-center justify-center p-4"><p>Gift not found.</p></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="w-full bg-white border-b border-border p-4 sticky top-0 z-10 flex items-center shadow-sm">
        <button onClick={() => navigate('/')} className="mr-4 p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <span className="font-medium text-slate-800">Your Gift</span>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full p-4 md:py-8 space-y-6">
        
        {/* Gift Header & Presentation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center text-center overflow-hidden relative"
        >
          {/* Decorative background blob */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-100 rounded-full blur-2xl opacity-60"></div>
          
          <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-inner z-10">
            <Gift className="w-10 h-10" />
          </div>
          
          <h1 className="text-2xl font-semibold text-slate-900 mb-2 z-10">
            You've received a gift!
          </h1>
          <p className="text-slate-500 mb-8 z-10">
            {buyer?.full_name ? `${buyer.full_name} sent you` : "Someone special sent you"} <span className="font-medium text-slate-800">{product.title}</span>.
          </p>

          {/* Product Image */}
          <div className="w-full aspect-video rounded-2xl overflow-hidden mb-6 bg-slate-100 shadow-sm relative group z-10 border border-slate-100">
            <img 
              src={product.images[0]} 
              alt={product.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
               <span className="text-white font-medium text-lg drop-shadow-md">{product.title}</span>
               <span className="bg-white/90 backdrop-blur text-slate-900 text-xs px-2 py-1 rounded-lg font-medium shadow-sm">
                 {formatZMW(product.price_zmw)}
               </span>
            </div>
          </div>
          
          <hr className="w-full border-slate-100 my-2" />

          {/* Code Section */}
          <div className="w-full pt-4 z-10">
            <p className="text-sm font-medium text-slate-500 mb-4 uppercase tracking-wider">Your Claim Info</p>
            
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
              {qrCodeDataUrl ? (
                <div className="bg-white p-2 w-fit mx-auto rounded-xl shadow-sm mb-6">
                  <img src={qrCodeDataUrl} alt="QR Code" className="w-32 h-32" />
                </div>
              ) : (
                <div className="w-32 h-32 mx-auto bg-slate-200 rounded-xl mb-6 animate-pulse"></div>
              )}

              <p className="text-xs text-slate-500 mb-2">Show this code at <span className="font-semibold text-slate-800">{shop.business_name}</span></p>
              
              <div 
                onClick={copyToClipboard}
                className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3 cursor-pointer hover:border-orange-400 hover:ring-2 hover:ring-orange-100 transition-all font-mono group"
              >
                <span className="text-xl tracking-widest text-slate-800 font-semibold">{claim_code}</span>
                <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">
                  <Copy className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Thank You Library Component */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
        >
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
             <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center">
                 <MessageCircleHeart className="w-5 h-5" />
               </div>
               <div>
                  <h3 className="font-semibold text-slate-900">Say Thank You</h3>
                  <p className="text-xs text-slate-500">Let them know you received it!</p>
               </div>
             </div>

             <AnimatePresence mode="wait">
               {!reactionSent ? (
                 <motion.div 
                   key="reactions"
                   initial={{ opacity: 0 }} 
                   animate={{ opacity: 1 }} 
                   exit={{ opacity: 0, scale: 0.95 }}
                   className="grid grid-cols-3 gap-3"
                 >
                   {THANK_YOU_REACTIONS.map((reaction, i) => (
                     <button
                       key={i}
                       onClick={() => handleSendReaction(reaction.emoji)}
                       className="flex flex-col items-center justify-center p-3 sm:py-5 border border-slate-100 bg-slate-50 rounded-2xl hover:bg-orange-50 hover:border-orange-200 transition-all active:scale-95 group"
                     >
                       <span className="text-3xl mb-2 group-hover:scale-110 transition-transform origin-bottom">{reaction.emoji}</span>
                       <span className="text-[10px] sm:text-xs text-slate-600 font-medium text-center">{reaction.text}</span>
                     </button>
                   ))}
                 </motion.div>
               ) : (
                 <motion.div 
                   key="success"
                   initial={{ opacity: 0, scale: 0.9 }} 
                   animate={{ opacity: 1, scale: 1 }}
                   className="py-8 flex flex-col items-center text-center bg-slate-50 rounded-2xl border border-slate-100"
                 >
                   <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4">
                     <CheckCircle2 className="w-8 h-8" />
                   </div>
                   <h4 className="font-semibold text-slate-900 mb-1">Reaction Sent!</h4>
                   <p className="text-sm text-slate-500 flex items-center gap-1">
                     You sent a {activeReaction} to {buyer?.full_name?.split(' ')[0] || "the sender"}.
                   </p>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        </motion.div>

        {/* Footer info */}
        <div className="text-center py-4 text-xs text-slate-400 flex items-center justify-center gap-1">
          Powered by <Heart className="w-3 h-3 text-red-400 mx-1" fill="currentColor" /> KithLy
        </div>

      </main>
      <Toaster position="bottom-right" />
    </div>
  );
}
