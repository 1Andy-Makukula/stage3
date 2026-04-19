import { useState } from 'react';
import { motion } from 'motion/react';
import { QrCode, Check, X, Smartphone, Camera } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '../ui/input-otp';
import { toast } from 'sonner';

interface HandshakeTerminalProps {
  onVerify: (code: string) => Promise<boolean>;
  mode: 'customer' | 'merchant';
}

export function HandshakeTerminal({ onVerify, mode }: HandshakeTerminalProps) {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showUploadPhoto, setShowUploadPhoto] = useState(false);
  const [photoUploaded, setPhotoUploaded] = useState(false);

  const handleVerify = async () => {
    if (code.length !== 8) {
      toast.error('Please enter the complete code');
      return;
    }

    setIsVerifying(true);
    setVerificationStatus('idle');

    try {
      const success = await onVerify(code);
      
      if (success) {
        setVerificationStatus('success');
        // Vibration feedback (if supported)
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 100]);
        }
        setShowUploadPhoto(true);
        toast.success('Handshake verified!', {
          description: 'Please provide proof of fulfillment.',
        });
      } else {
        setVerificationStatus('error');
        toast.error('Invalid code', {
          description: 'Please check and try again',
        });
      }
    } catch (error) {
      setVerificationStatus('error');
      toast.error('Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCompleteEscrow = () => {
    if (!photoUploaded) { 
      toast.error('Photo proof is required.'); 
      return; 
    }
    toast.success('Escrow released successfully!');
    setShowUploadPhoto(false);
    setCode('');
    setVerificationStatus('idle');
    setPhotoUploaded(false);
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#F97316] to-[#FB923C] flex items-center justify-center">
          <Smartphone className="w-8 h-8 text-white" strokeWidth={1.5} />
        </div>
        <h2 className="font-light text-black">
          {mode === 'merchant' ? 'Verify Gift Code' : 'Your Gift Code'}
        </h2>
        <p className="text-sm font-light text-muted-foreground">
          {mode === 'merchant'
            ? 'Enter the 8-character code from the customer'
            : 'Show this code to the merchant to claim your gift'}
        </p>
      </div>

      {mode === 'merchant' ? (
        <div className="space-y-4">
          {showUploadPhoto ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 text-center"
            >
              <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center justify-center gap-2 mb-6 border border-green-100">
                <Check className="w-5 h-5 font-bold" />
                <span className="font-medium">Code Verified</span>
              </div>
              
              <div className="border-2 border-dashed border-border rounded-2xl p-8 hover:bg-gray-50 transition-colors cursor-pointer group">
                {photoUploaded ? (
                   <div className="flex flex-col items-center">
                     <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-3">
                       <Check className="w-8 h-8" />
                     </div>
                     <p className="font-medium">Photo Attached</p>
                     <p className="text-xs text-muted-foreground">Proof of fulfillment saved.</p>
                   </div>
                ) : (
                  <div className="flex flex-col items-center" onClick={() => {
                    toast('Uploading photo...');
                    setTimeout(() => setPhotoUploaded(true), 800);
                  }}>
                    <Camera className="w-10 h-10 text-muted-foreground mb-3 group-hover:text-orange-500 transition-colors" />
                    <p className="font-medium text-black">Take Photo of Item</p>
                    <p className="text-xs text-muted-foreground mt-1 text-center max-w-[200px] mx-auto">
                      Take a picture of the customer with the product. Required to release escrow.
                    </p>
                  </div>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCompleteEscrow}
                className={`w-full py-3 rounded-full font-light shadow-lg transition-all ${photoUploaded ? 'bg-gradient-to-r from-[#F97316] to-[#FB923C] text-white hover:shadow-xl' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
              >
                Complete & Release Escrow
              </motion.button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {/* 8-Character Input with Separator */}
              <div className="flex justify-center">
                <InputOTP
                  maxLength={8}
                  value={code}
                  onChange={setCode}
                  onComplete={handleVerify}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="w-12 h-14 text-lg font-mono" />
                    <InputOTPSlot index={1} className="w-12 h-14 text-lg font-mono" />
                    <InputOTPSlot index={2} className="w-12 h-14 text-lg font-mono" />
                    <InputOTPSlot index={3} className="w-12 h-14 text-lg font-mono" />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={4} className="w-12 h-14 text-lg font-mono" />
                    <InputOTPSlot index={5} className="w-12 h-14 text-lg font-mono" />
                    <InputOTPSlot index={6} className="w-12 h-14 text-lg font-mono" />
                    <InputOTPSlot index={7} className="w-12 h-14 text-lg font-mono" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {/* Verify Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleVerify}
                disabled={code.length !== 8 || isVerifying}
                className="w-full py-3 bg-gradient-to-r from-[#F97316] to-[#FB923C] text-white rounded-full font-light disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
              >
                {isVerifying ? 'Verifying...' : 'Verify Code'}
              </motion.button>

              {/* Status Indicator */}
              {verificationStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 justify-center p-3 rounded-lg bg-red-50 text-red-700"
                >
                  <X className="w-5 h-5" strokeWidth={1.5} />
                  <span className="font-light">Invalid Code</span>
                </motion.div>
              )}

              {/* QR Scanner Option */}
              <div className="pt-4 border-t border-border">
                <button className="w-full flex items-center justify-center gap-2 py-3 border border-border rounded-full hover:bg-gray-50 transition-colors font-light">
                  <QrCode className="w-5 h-5" strokeWidth={1.5} />
                  Scan QR Code Instead
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Customer View: Display Code
        <div className="space-y-6">
          <div className="aspect-square max-w-xs mx-auto bg-white rounded-[1rem] border-2 border-border p-6 flex items-center justify-center">
            <div className="text-center space-y-4">
              <QrCode className="w-32 h-32 mx-auto text-black" strokeWidth={1} />
              <p className="text-xs font-light text-muted-foreground">
                High-contrast QR code
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-[1rem] p-6 text-center">
            <p className="text-xs font-light text-muted-foreground mb-3">
              Or enter manually
            </p>
            <div className="text-3xl font-mono tracking-widest text-slate-800 font-semibold">
              KL-8A9B2C
            </div>
          </div>

          <button className="w-full py-3 border border-border rounded-full hover:bg-gray-50 transition-colors font-light">
            Merchant won't accept my code?
          </button>
        </div>
      )}
    </div>
  );
}
