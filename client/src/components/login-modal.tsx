import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simple client-side validation (you should implement proper server-side auth)
    if (username === "Cat" && password === "Cat@Renagde.wtf73") {
      // Store auth token in localStorage
      localStorage.setItem("admin_auth", "authenticated");
      localStorage.setItem("admin_auth_time", Date.now().toString());
      
      toast({
        title: "Login successful",
        description: "Welcome to the admin panel!",
      });
      
      onLoginSuccess();
      onClose();
      setUsername("");
      setPassword("");
    } else {
      toast({
        title: "Login failed",
        description: "Invalid username or password.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const handleClose = () => {
    setUsername("");
    setPassword("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-dark-gray border-light-gray/30 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-center flex items-center justify-center gap-2">
            <Lock className="h-5 w-5 text-gaming-purple" />
            Admin Login
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-gray-300 text-sm">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-medium-gray border-light-gray focus:border-gaming-purple pl-10"
                placeholder="Enter username"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-gray-300 text-sm">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-medium-gray border-light-gray focus:border-gaming-purple pl-10 pr-10"
                placeholder="Enter password"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 h-6 w-6 p-0 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-gaming-purple hover:bg-gaming-purple/80"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            <Button
              type="button"
              onClick={handleClose}
              variant="secondary"
              className="flex-1 bg-gray-600 hover:bg-gray-700"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}