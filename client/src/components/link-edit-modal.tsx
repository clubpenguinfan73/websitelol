import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Link } from "@shared/schema";

interface LinkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  link: Link | null;
}

const iconOptions = [
  { value: "fas fa-link", label: "Default", color: "bg-gray-600" },
  { value: "fab fa-twitch", label: "Twitch", color: "bg-gaming-purple" },
  { value: "fab fa-youtube", label: "YouTube", color: "bg-red-600" },
  { value: "fab fa-twitter", label: "Twitter", color: "bg-gaming-cyan" },
  { value: "fab fa-discord", label: "Discord", color: "bg-indigo-600" },
  { value: "fab fa-spotify", label: "Spotify", color: "bg-green-600" },
  { value: "fab fa-instagram", label: "Instagram", color: "bg-pink-600" },
  { value: "fab fa-tiktok", label: "TikTok", color: "bg-black" },
];

export default function LinkEditModal({ isOpen, onClose, link }: LinkEditModalProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("fas fa-link");
  const [color, setColor] = useState("bg-gray-600");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createLinkMutation = useMutation({
    mutationFn: async (linkData: Omit<Link, "id">) => {
      const response = await apiRequest("/api/links", "POST", linkData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      toast({
        title: "Link created",
        description: "The link has been created successfully.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create link. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateLinkMutation = useMutation({
    mutationFn: async (linkData: Partial<Link>) => {
      const response = await apiRequest(`/api/links/${link?.id}`, "PUT", linkData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      toast({
        title: "Link updated",
        description: "The link has been updated successfully.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update link. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (link) {
      setTitle(link.title);
      setUrl(link.url);
      setDescription(link.description || "");
      setIcon(link.icon);
      setColor(link.color);
    } else {
      setTitle("");
      setUrl("");
      setDescription("");
      setIcon("fas fa-link");
      setColor("bg-gray-600");
    }
  }, [link]);

  const handleIconChange = (value: string) => {
    setIcon(value);
    const selectedIcon = iconOptions.find(option => option.value === value);
    if (selectedIcon) {
      setColor(selectedIcon.color);
    }
  };

  const handleSave = () => {
    if (!title || !url) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const linkData = {
      title,
      url,
      description,
      icon,
      color,
      order: link?.order || 0,
    };

    if (link) {
      updateLinkMutation.mutate(linkData);
    } else {
      createLinkMutation.mutate(linkData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-dark-gray border-light-gray/30">
        <DialogHeader>
          <DialogTitle className="text-white">
            {link ? "Edit Link" : "Create New Link"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Input
            placeholder="Link Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-medium-gray border-light-gray focus:border-gaming-purple"
          />
          
          <Input
            type="url"
            placeholder="Link URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="bg-medium-gray border-light-gray focus:border-gaming-purple"
          />
          
          <Input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-medium-gray border-light-gray focus:border-gaming-purple"
          />
          
          <Select value={icon} onValueChange={handleIconChange}>
            <SelectTrigger className="bg-medium-gray border-light-gray focus:border-gaming-purple">
              <SelectValue placeholder="Select icon" />
            </SelectTrigger>
            <SelectContent className="bg-medium-gray border-light-gray">
              {iconOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 ${option.color} rounded flex items-center justify-center`}>
                      <i className={`${option.value} text-white text-xs`}></i>
                    </div>
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex space-x-3">
            <Button
              onClick={handleSave}
              className="flex-1 bg-gaming-purple hover:bg-gaming-purple/80"
              disabled={createLinkMutation.isPending || updateLinkMutation.isPending}
            >
              {createLinkMutation.isPending || updateLinkMutation.isPending ? "Saving..." : "Save"}
            </Button>
            <Button
              onClick={onClose}
              variant="secondary"
              className="flex-1 bg-gray-600 hover:bg-gray-700"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
