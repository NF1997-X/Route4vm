import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PasswordPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  title: string;
  description: string;
}

export function PasswordPrompt({ open, onOpenChange, onSuccess, title, description }: PasswordPromptProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const correctPassword = "Acun97";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === correctPassword) {
      onSuccess();
      onOpenChange(false);
      setPassword("");
      toast({
        title: "Access Granted",
        description: "You now have access to restricted features.",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Incorrect password. Please try again.",
        variant: "destructive",
      });
      setPassword("");
    }
  };

  const handleCancel = () => {
    setPassword("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm animate-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:zoom-out-90 duration-300 transition-all bg-white/80 dark:bg-black/70 backdrop-blur-2xl border border-white/30 dark:border-white/10 shadow-2xl shadow-black/10 dark:shadow-black/40 rounded-xl">
        {/* Glass Layer */}
        <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-white/20 via-white/10 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent backdrop-blur-3xl border-0 shadow-inner" />
        
        <DialogHeader className="relative z-10 space-y-2">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 relative z-10">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10 h-9 text-[10px] placeholder:text-[10px]"
                data-testid="password-input"
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-9 w-9 px-0 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                data-testid="toggle-password-visibility"
              >
                {showPassword ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-8 px-3 text-xs bg-transparent border-transparent text-red-500 hover:bg-red-500/10 transition-all duration-300"
                data-testid="cancel-password"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!password.trim()}
                className="h-8 px-3 text-xs bg-transparent border-transparent hover:bg-transparent disabled:text-gray-400 disabled:opacity-100 text-green-500 disabled:hover:bg-transparent transition-all duration-300"
                data-testid="submit-password"
              >
                <Lock className="h-3 w-3 mr-1.5" />
                Unlock
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}