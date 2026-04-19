import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';

interface AdCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdCampaignModal({ isOpen, onClose }: AdCampaignModalProps) {
  const [name, setName] = useState('');
  const [budgetZmw, setBudgetZmw] = useState('');
  const [durationDays, setDurationDays] = useState('7');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setBudgetZmw('');
      setDurationDays('7');
      setNotes('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const budget = Number(budgetZmw);
    if (!name.trim() || !Number.isFinite(budget) || budget <= 0) {
      toast.error('Add a campaign name and a valid budget.');
      return;
    }
    toast.success('Campaign draft saved', {
      description: `${name} · ZMW ${budget.toFixed(2)} · ${durationDays} days`,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-light">Create ad campaign</DialogTitle>
          <DialogDescription className="font-light">
            Promote a listing or your shop in discovery. Billing runs against your wallet when the
            network goes live.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <Label htmlFor="camp-name" className="text-xs font-light text-muted-foreground">
              Campaign name
            </Label>
            <Input
              id="camp-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Summer Sale Spotlight"
              className="mt-1 font-light"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="camp-budget" className="text-xs font-light text-muted-foreground">
                Budget (ZMW)
              </Label>
              <Input
                id="camp-budget"
                type="number"
                min="1"
                step="1"
                value={budgetZmw}
                onChange={(e) => setBudgetZmw(e.target.value)}
                className="mt-1 font-light"
                required
              />
            </div>
            <div>
              <Label htmlFor="camp-days" className="text-xs font-light text-muted-foreground">
                Duration (days)
              </Label>
              <Input
                id="camp-days"
                type="number"
                min="1"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                className="mt-1 font-light"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="camp-notes" className="text-xs font-light text-muted-foreground">
              Targeting notes (optional)
            </Label>
            <Textarea
              id="camp-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Districts, categories, or SKUs to emphasize…"
              className="mt-1 min-h-[80px] font-light resize-none"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} className="font-light rounded-xl">
              Cancel
            </Button>
            <Button
              type="submit"
              className="font-light rounded-xl bg-gradient-to-r from-[#F97316] to-[#FB923C] text-white"
            >
              Save campaign
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
