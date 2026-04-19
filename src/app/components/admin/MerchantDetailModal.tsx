import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Shop } from "../../types";
import { Store, CheckCircle, Clock, Ban } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { toast } from "sonner";

interface MerchantDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  shop: Shop | null;
}

export function MerchantDetailModal({ isOpen, onClose, shop }: MerchantDetailModalProps) {
  if (!shop) return null;

  const handleVerify = () => {
    toast.success("Merchant application approved!");
    onClose();
  };

  const handleSuspend = () => {
    toast.error("Merchant shop suspended");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Store className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <DialogTitle className="font-light">{shop.business_name}</DialogTitle>
              <DialogDescription className="font-light line-clamp-1">{shop.description || 'No description'}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground font-light mb-1">Status</p>
              <Badge variant={shop.status === 'active' ? 'default' : 'secondary'} className="font-light capitalize">
                {shop.status}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-light mb-1">Location</p>
              <p className="text-sm font-light">{shop.district?.name}, {shop.district?.province}</p>
            </div>
            
            <div className="col-span-2 bg-gray-50 p-4 rounded-xl border border-border grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Rating</p>
                <p className="font-medium text-black">{shop.rating.toFixed(1)} ⭐</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Sales</p>
                <p className="font-medium text-black">{shop.total_transactions}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Success</p>
                <p className="font-medium text-black">{shop.success_rate}%</p>
              </div>
            </div>

            <div className="col-span-2">
              <p className="text-xs text-muted-foreground font-light mb-1">TPIN (Tax ID)</p>
              <p className="text-sm font-light bg-gray-50 p-2 rounded-lg border border-border">{shop.tpin}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-border">
          {shop.status === 'pending' && (
            <Button onClick={handleVerify} className="flex-1 font-light bg-green-600 hover:bg-green-700 text-white">
              Approve Shop
            </Button>
          )}
          <Button variant="destructive" onClick={handleSuspend} className="font-light w-full">
            <Ban className="w-4 h-4 mr-2" /> Suspend Shop
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
