import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { User, UserProfile } from "../../types";
import { CheckCircle, Clock, User as UserIcon, Ban } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { profileDisplayName } from "../../utils/formatters";

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  profile: UserProfile | null;
}

export function UserDetailModal({ isOpen, onClose, user, profile }: UserDetailModalProps) {
  if (!user) return null;

  const displayName = profileDisplayName(user, profile);

  const handleVerify = () => {
    toast.success("User verified successfully");
    onClose();
  };

  const handleSuspend = () => {
    toast.error("User account suspended");
    onClose();
  };

  const verified = profile?.is_verified ?? false;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <DialogTitle className="font-light">{displayName}</DialogTitle>
              <DialogDescription className="font-light">{user.email}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground font-light mb-1">Role</p>
              <Badge variant="outline" className="font-light capitalize">{user.role}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-light mb-1">Status</p>
              {profile && verified ? (
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4" /> <span className="font-light">Verified</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-orange-600 text-sm">
                  <Clock className="w-4 h-4" /> <span className="font-light">
                    {profile ? "Pending verification" : "No profile document"}
                  </span>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-light mb-1">Phone</p>
              <p className="text-sm font-light">{user.phone}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-light mb-1">District</p>
              <p className="text-sm font-light">{profile?.district?.name || "—"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground font-light mb-1">NRC Number</p>
              <p className="text-sm font-light bg-gray-50 p-2 rounded-lg border border-border">
                {profile?.nrc_number || "—"}
              </p>
            </div>
            {profile?.tpin && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground font-light mb-1">TPIN</p>
                <p className="text-sm font-light bg-gray-50 p-2 rounded-lg border border-border">{profile.tpin}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-border">
          {profile && !verified && (
            <Button onClick={handleVerify} className="flex-1 font-light bg-green-600 hover:bg-green-700 text-white">
              Approve & Verify
            </Button>
          )}
          <Button variant="destructive" onClick={handleSuspend} className="font-light w-full">
            <Ban className="w-4 h-4 mr-2" /> Suspend User
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
