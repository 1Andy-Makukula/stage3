import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAdminEngine } from '../../hooks/useAdminEngine';
import { toast } from 'sonner';

interface GhostOnboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function GhostOnboardModal({ isOpen, onClose, onSuccess }: GhostOnboardModalProps) {
  const { ghostOnboard, loading } = useAdminEngine();
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    businessName: '',
    category: 'food',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ghostOnboard(formData.email, {
        business_name: formData.businessName,
        category: formData.category,
        full_name: formData.fullName
      });
      toast.success('Ghost Onboarding Success', { description: `${formData.businessName} has been provisioned.` });
      onSuccess();
      onClose();
    } catch (err) {
      // Error handled by hook
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light italic">Ghost Onboarding</DialogTitle>
          <DialogDescription className="font-light">
            Provision a shop and user profile without their active presence.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="font-light text-xs uppercase tracking-widest text-muted-foreground">User Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="merchant@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fullName" className="font-light text-xs uppercase tracking-widest text-muted-foreground">Full Name</Label>
              <Input
                id="fullName"
                placeholder="Andy Makukula"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="businessName" className="font-light text-xs uppercase tracking-widest text-muted-foreground">Business Name</Label>
              <Input
                id="businessName"
                placeholder="KithLy Gourmet"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                required
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category" className="font-light text-xs uppercase tracking-widest text-muted-foreground">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(val) => setFormData({ ...formData, category: val })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="food">Food & Grocery</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="fashion">Fashion</SelectItem>
                  <SelectItem value="gifts">Gifts & Cards</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-black text-white hover:bg-zinc-800 h-12 font-light"
            >
              {loading ? 'Provisioning engine...' : 'Execute Ghost Onboard'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
