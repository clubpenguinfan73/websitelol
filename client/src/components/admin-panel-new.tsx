import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Trash2, Plus, Edit2, LogOut, Music, User, Image, ExternalLink, Wand2 } from "lucide-react";
import UsernameEffects from "./username-effects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Profile, Link } from "@shared/schema";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: Profile;
  links: Link[];
  onNewLink: () => void;
  onEditLink: (link: Link) => void;
  onLogout?: () => void;
}

export default function AdminPanel({ 
  isOpen, 
  onClose, 
  profile, 
  links, 
  onNewLink, 
  onEditLink,
  onLogout 
}: AdminPanelProps) {
  const [username, setUsername] = useState(profile?.username || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [entranceText, setEntranceText] = useState(profile?.entranceText || "click to enter...");
  const [entranceFontSize, setEntranceFontSize] = useState(profile?.entranceFontSize || "4xl");
  const [entranceFontFamily, setEntranceFontFamily] = useState(profile?.entranceFontFamily || "Inter");
  const [entranceFontColor, setEntranceFontColor] = useState(profile?.entranceFontColor || "#ffffff");
  const [usernameEffect, setUsernameEffect] = useState(profile?.usernameEffect || "none");
  const [animatedTitleEnabled, setAnimatedTitleEnabled] = useState(profile?.animatedTitleEnabled || false);
  const [animatedTitleTexts, setAnimatedTitleTexts] = useState(profile?.animatedTitleTexts || "");
  const [animatedTitleSpeed, setAnimatedTitleSpeed] = useState(profile?.animatedTitleSpeed || 1000);
  const [musicEnabled, setMusicEnabled] = useState(profile?.musicEnabled || false);
  const [discordEnabled, setDiscordEnabled] = useState(profile?.discordEnabled || false);
  const [discordUserId, setDiscordUserId] = useState(profile?.discordUserId || "");
  const [discordApplicationId, setDiscordApplicationId] = useState(profile?.discordApplicationId || "");
  const [spotifyEnabled, setSpotifyEnabled] = useState(profile?.spotifyEnabled || false);
  const [spotifyTrackName, setSpotifyTrackName] = useState(profile?.spotifyTrackName || "");
  const [spotifyArtistName, setSpotifyArtistName] = useState(profile?.spotifyArtistName || "");
  const [spotifyAlbumArt, setSpotifyAlbumArt] = useState(profile?.spotifyAlbumArt || "");
  const [spotifyTrackUrl, setSpotifyTrackUrl] = useState(profile?.spotifyTrackUrl || "");
  const [profileEffect, setProfileEffect] = useState(profile?.profileEffect || "none");
  
  const backgroundUploadRef = useRef<HTMLInputElement>(null);
  const profileUploadRef = useRef<HTMLInputElement>(null);
  const musicUploadRef = useRef<HTMLInputElement>(null);
  const spotifyAlbumUploadRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Sync local state with profile prop changes
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setBio(profile.bio || "");
      setEntranceText(profile.entranceText || "click to enter...");
      setEntranceFontSize(profile.entranceFontSize || "4xl");
      setEntranceFontFamily(profile.entranceFontFamily || "Inter");
      setEntranceFontColor(profile.entranceFontColor || "#ffffff");
      setUsernameEffect(profile.usernameEffect || "none");
      setAnimatedTitleEnabled(profile.animatedTitleEnabled || false);
      setAnimatedTitleTexts(profile.animatedTitleTexts || "");
      setAnimatedTitleSpeed(profile.animatedTitleSpeed || 1000);
      setMusicEnabled(profile.musicEnabled || false);
      setDiscordEnabled(profile.discordEnabled || false);
      setDiscordUserId(profile.discordUserId || "");
      setDiscordApplicationId(profile.discordApplicationId || "");
      setSpotifyEnabled(profile.spotifyEnabled || false);
      setSpotifyTrackName(profile.spotifyTrackName || "");
      setSpotifyArtistName(profile.spotifyArtistName || "");
      setSpotifyAlbumArt(profile.spotifyAlbumArt || "");
      setSpotifyTrackUrl(profile.spotifyTrackUrl || "");
      setProfileEffect(profile.profileEffect || "none");
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/profile", "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Profile updated successfully",
        description: "Your changes have been saved.",
      });
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/links/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      toast({
        title: "Link deleted",
        description: "The link has been removed from your profile.",
      });
    },
  });

  const handleFileUpload = (file: File, type: 'background' | 'profile' | 'music' | 'spotify-album') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      const updateData: any = {
        username: username || profile?.username || "",
        bio: bio || profile?.bio || "",
        entranceText: entranceText || profile?.entranceText || "click to enter...",
        entranceFontSize: entranceFontSize || profile?.entranceFontSize || "4xl",
        entranceFontFamily: entranceFontFamily || profile?.entranceFontFamily || "Inter",
        entranceFontColor: entranceFontColor || profile?.entranceFontColor || "#ffffff",
        usernameEffect: usernameEffect || profile?.usernameEffect || "none",
        animatedTitleEnabled: animatedTitleEnabled,
        animatedTitleTexts: animatedTitleTexts,
        animatedTitleSpeed: animatedTitleSpeed,
        profilePicture: profile?.profilePicture,
        backgroundImage: profile?.backgroundImage,
        backgroundMusic: profile?.backgroundMusic,
        musicEnabled: musicEnabled,
        discordEnabled: discordEnabled,
        discordUserId: discordUserId,
        discordApplicationId: discordApplicationId,
        spotifyEnabled: spotifyEnabled,
        spotifyTrackName: spotifyTrackName,
        spotifyArtistName: spotifyArtistName,
        spotifyAlbumArt: spotifyAlbumArt,
        spotifyTrackUrl: spotifyTrackUrl,
        profileEffect: profileEffect,
      };

      if (type === 'background') {
        updateData.backgroundImage = result;
      } else if (type === 'profile') {
        updateData.profilePicture = result;
      } else if (type === 'music') {
        updateData.backgroundMusic = result;
        updateData.musicEnabled = true;
        setMusicEnabled(true);
      } else if (type === 'spotify-album') {
        updateData.spotifyAlbumArt = result;
        setSpotifyAlbumArt(result);
      }

      updateProfileMutation.mutate(updateData);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({
      username,
      bio,
      entranceText,
      entranceFontSize,
      entranceFontFamily,
      entranceFontColor,
      usernameEffect,
      animatedTitleEnabled,
      animatedTitleTexts,
      animatedTitleSpeed,
      profilePicture: profile?.profilePicture,
      backgroundImage: profile?.backgroundImage,
      backgroundMusic: profile?.backgroundMusic,
      musicEnabled: musicEnabled,
      discordEnabled: discordEnabled,
      discordUserId: discordUserId,
      discordApplicationId: discordApplicationId,
      spotifyEnabled: spotifyEnabled,
      spotifyTrackName: spotifyTrackName,
      spotifyArtistName: spotifyArtistName,
      spotifyAlbumArt: spotifyAlbumArt,
      spotifyTrackUrl: spotifyTrackUrl,
      profileEffect: profileEffect,
    });
  };

  const handleSaveAnimatedTitle = () => {
    updateProfileMutation.mutate({
      username: username || profile?.username || "",
      bio: bio || profile?.bio || "",
      entranceText: entranceText || profile?.entranceText || "click to enter...",
      entranceFontSize: entranceFontSize || profile?.entranceFontSize || "4xl",
      entranceFontFamily: entranceFontFamily || profile?.entranceFontFamily || "Inter",
      entranceFontColor: entranceFontColor || profile?.entranceFontColor || "#ffffff",
      usernameEffect: usernameEffect || profile?.usernameEffect || "none",
      animatedTitleEnabled,
      animatedTitleTexts,
      animatedTitleSpeed,
      profilePicture: profile?.profilePicture,
      backgroundImage: profile?.backgroundImage,
      backgroundMusic: profile?.backgroundMusic,
      musicEnabled: musicEnabled,
      discordEnabled: discordEnabled,
      discordUserId: discordUserId,
      discordApplicationId: discordApplicationId,
      spotifyEnabled: spotifyEnabled,
      spotifyTrackName: spotifyTrackName,
      spotifyArtistName: spotifyArtistName,
      spotifyAlbumArt: spotifyAlbumArt,
      spotifyTrackUrl: spotifyTrackUrl,
    });
  };

  const handleSaveProfileEffects = () => {
    updateProfileMutation.mutate({
      username: username || profile?.username || "",
      bio: bio || profile?.bio || "",
      entranceText: entranceText || profile?.entranceText || "click to enter...",
      entranceFontSize: entranceFontSize || profile?.entranceFontSize || "4xl",
      entranceFontFamily: entranceFontFamily || profile?.entranceFontFamily || "Inter",
      entranceFontColor: entranceFontColor || profile?.entranceFontColor || "#ffffff",
      usernameEffect: usernameEffect || profile?.usernameEffect || "none",
      animatedTitleEnabled: animatedTitleEnabled,
      animatedTitleTexts: animatedTitleTexts,
      animatedTitleSpeed: animatedTitleSpeed,
      profilePicture: profile?.profilePicture,
      backgroundImage: profile?.backgroundImage,
      backgroundMusic: profile?.backgroundMusic,
      musicEnabled: musicEnabled,
      discordEnabled: discordEnabled,
      discordUserId: discordUserId,
      discordApplicationId: discordApplicationId,
      spotifyEnabled: spotifyEnabled,
      spotifyTrackName: spotifyTrackName,
      spotifyArtistName: spotifyArtistName,
      spotifyAlbumArt: spotifyAlbumArt,
      spotifyTrackUrl: spotifyTrackUrl,
      profileEffect: profileEffect,
    });
  };

  const handleSaveUsernameEffects = () => {
    updateProfileMutation.mutate({
      username: username || profile?.username || "",
      bio: bio || profile?.bio || "",
      entranceText: entranceText || profile?.entranceText || "click to enter...",
      entranceFontSize: entranceFontSize || profile?.entranceFontSize || "4xl",
      entranceFontFamily: entranceFontFamily || profile?.entranceFontFamily || "Inter",
      entranceFontColor: entranceFontColor || profile?.entranceFontColor || "#ffffff",
      usernameEffect: usernameEffect,
      animatedTitleEnabled: animatedTitleEnabled,
      animatedTitleTexts: animatedTitleTexts,
      animatedTitleSpeed: animatedTitleSpeed,
      profilePicture: profile?.profilePicture,
      backgroundImage: profile?.backgroundImage,
      backgroundMusic: profile?.backgroundMusic,
      musicEnabled: musicEnabled,
      discordEnabled: discordEnabled,
      discordUserId: discordUserId,
      discordApplicationId: discordApplicationId,
      spotifyEnabled: spotifyEnabled,
      spotifyTrackName: spotifyTrackName,
      spotifyArtistName: spotifyArtistName,
      spotifyAlbumArt: spotifyAlbumArt,
      spotifyTrackUrl: spotifyTrackUrl,
      profileEffect: profileEffect,
    });
  };

  const handleToggleMusic = (checked: boolean) => {
    setMusicEnabled(checked);
    updateProfileMutation.mutate({
      username: username || profile?.username || "",
      bio: bio || profile?.bio || "",
      entranceText: entranceText || profile?.entranceText || "click to enter...",
      entranceFontSize: entranceFontSize || profile?.entranceFontSize || "4xl",
      entranceFontFamily: entranceFontFamily || profile?.entranceFontFamily || "Inter",
      entranceFontColor: entranceFontColor || profile?.entranceFontColor || "#ffffff",
      profilePicture: profile?.profilePicture,
      backgroundImage: profile?.backgroundImage,
      backgroundMusic: profile?.backgroundMusic,
      musicEnabled: checked,
      discordEnabled: profile?.discordEnabled,
      discordUserId: profile?.discordUserId,
      discordApplicationId: profile?.discordApplicationId,
      spotifyEnabled: profile?.spotifyEnabled,
      spotifyTrackName: profile?.spotifyTrackName,
      spotifyArtistName: profile?.spotifyArtistName,
      spotifyAlbumArt: profile?.spotifyAlbumArt,
      spotifyTrackUrl: profile?.spotifyTrackUrl,
    });
  };

  const handleToggleDiscord = (checked: boolean) => {
    setDiscordEnabled(checked);
    updateProfileMutation.mutate({
      username: username || profile?.username || "",
      bio: bio || profile?.bio || "",
      entranceText: entranceText || profile?.entranceText || "click to enter...",
      entranceFontSize: entranceFontSize || profile?.entranceFontSize || "4xl",
      entranceFontFamily: entranceFontFamily || profile?.entranceFontFamily || "Inter",
      entranceFontColor: entranceFontColor || profile?.entranceFontColor || "#ffffff",
      profilePicture: profile?.profilePicture,
      backgroundImage: profile?.backgroundImage,
      backgroundMusic: profile?.backgroundMusic,
      musicEnabled: profile?.musicEnabled,
      discordEnabled: checked,
      discordUserId: profile?.discordUserId,
      discordApplicationId: profile?.discordApplicationId,
      spotifyEnabled: profile?.spotifyEnabled,
      spotifyTrackName: profile?.spotifyTrackName,
      spotifyArtistName: profile?.spotifyArtistName,
      spotifyAlbumArt: profile?.spotifyAlbumArt,
      spotifyTrackUrl: profile?.spotifyTrackUrl,
    });
  };

  const handleToggleSpotify = (checked: boolean) => {
    setSpotifyEnabled(checked);
    updateProfileMutation.mutate({
      username: username || profile?.username || "",
      bio: bio || profile?.bio || "",
      entranceText: entranceText || profile?.entranceText || "click to enter...",
      entranceFontSize: entranceFontSize || profile?.entranceFontSize || "4xl",
      entranceFontFamily: entranceFontFamily || profile?.entranceFontFamily || "Inter",
      entranceFontColor: entranceFontColor || profile?.entranceFontColor || "#ffffff",
      profilePicture: profile?.profilePicture,
      backgroundImage: profile?.backgroundImage,
      backgroundMusic: profile?.backgroundMusic,
      musicEnabled: profile?.musicEnabled,
      discordEnabled: profile?.discordEnabled,
      discordUserId: profile?.discordUserId,
      discordApplicationId: profile?.discordApplicationId,
      spotifyEnabled: checked,
      spotifyTrackName: profile?.spotifyTrackName,
      spotifyArtistName: profile?.spotifyArtistName,
      spotifyAlbumArt: profile?.spotifyAlbumArt,
      spotifyTrackUrl: profile?.spotifyTrackUrl,
    });
  };

  const handleUpdateDiscordSettings = () => {
    updateProfileMutation.mutate({
      username: username || profile?.username || "",
      bio: bio || profile?.bio || "",
      entranceText: entranceText || profile?.entranceText || "click to enter...",
      entranceFontSize: entranceFontSize || profile?.entranceFontSize || "4xl",
      entranceFontFamily: entranceFontFamily || profile?.entranceFontFamily || "Inter",
      entranceFontColor: entranceFontColor || profile?.entranceFontColor || "#ffffff",
      profilePicture: profile?.profilePicture,
      backgroundImage: profile?.backgroundImage,
      backgroundMusic: profile?.backgroundMusic,
      musicEnabled: profile?.musicEnabled,
      discordEnabled: profile?.discordEnabled,
      discordUserId,
      discordApplicationId,
      spotifyEnabled: profile?.spotifyEnabled,
      spotifyTrackName: profile?.spotifyTrackName,
      spotifyArtistName: profile?.spotifyArtistName,
      spotifyAlbumArt: profile?.spotifyAlbumArt,
      spotifyTrackUrl: profile?.spotifyTrackUrl,
    });
  };

  const handleUpdateSpotifySettings = () => {
    updateProfileMutation.mutate({
      username: username || profile?.username || "",
      bio: bio || profile?.bio || "",
      entranceText: entranceText || profile?.entranceText || "click to enter...",
      entranceFontSize: entranceFontSize || profile?.entranceFontSize || "4xl",
      entranceFontFamily: entranceFontFamily || profile?.entranceFontFamily || "Inter",
      entranceFontColor: entranceFontColor || profile?.entranceFontColor || "#ffffff",
      profilePicture: profile?.profilePicture,
      backgroundImage: profile?.backgroundImage,
      backgroundMusic: profile?.backgroundMusic,
      musicEnabled: profile?.musicEnabled,
      discordEnabled: profile?.discordEnabled,
      discordUserId: profile?.discordUserId,
      discordApplicationId: profile?.discordApplicationId,
      spotifyEnabled: profile?.spotifyEnabled,
      spotifyTrackName,
      spotifyArtistName,
      spotifyAlbumArt,
      spotifyTrackUrl,
    });
  };

  const handleRemoveMusic = () => {
    updateProfileMutation.mutate({
      username: username || profile?.username || "",
      bio: bio || profile?.bio || "",
      entranceText: entranceText || profile?.entranceText || "click to enter...",
      entranceFontSize: entranceFontSize || profile?.entranceFontSize || "4xl",
      entranceFontFamily: entranceFontFamily || profile?.entranceFontFamily || "Inter",
      entranceFontColor: entranceFontColor || profile?.entranceFontColor || "#ffffff",
      usernameEffect: usernameEffect || profile?.usernameEffect || "none",
      animatedTitleEnabled: animatedTitleEnabled,
      animatedTitleTexts: animatedTitleTexts,
      animatedTitleSpeed: animatedTitleSpeed,
      profilePicture: profile?.profilePicture,
      backgroundImage: profile?.backgroundImage,
      backgroundMusic: null,
      musicEnabled: false,
      discordEnabled: discordEnabled,
      discordUserId: discordUserId,
      discordApplicationId: discordApplicationId,
      spotifyEnabled: spotifyEnabled,
      spotifyTrackName: spotifyTrackName,
      spotifyArtistName: spotifyArtistName,
      spotifyAlbumArt: spotifyAlbumArt,
      spotifyTrackUrl: spotifyTrackUrl,
      profileEffect: profileEffect,
    });
    setMusicEnabled(false);
  };

  const handleDeleteLink = (linkId: number) => {
    deleteLinkMutation.mutate(linkId);
  };

  const handleRemoveBackground = () => {
    updateProfileMutation.mutate({
      username: username || profile?.username || "",
      bio: bio || profile?.bio || "",
      entranceText: entranceText || profile?.entranceText || "click to enter...",
      entranceFontSize: entranceFontSize || profile?.entranceFontSize || "4xl",
      entranceFontFamily: entranceFontFamily || profile?.entranceFontFamily || "Inter",
      entranceFontColor: entranceFontColor || profile?.entranceFontColor || "#ffffff",
      profilePicture: profile?.profilePicture,
      backgroundImage: "",
      backgroundMusic: profile?.backgroundMusic,
      musicEnabled: profile?.musicEnabled,
      discordEnabled: profile?.discordEnabled,
      discordUserId: profile?.discordUserId,
      discordApplicationId: profile?.discordApplicationId,
      spotifyEnabled: profile?.spotifyEnabled,
      spotifyTrackName: profile?.spotifyTrackName,
      spotifyArtistName: profile?.spotifyArtistName,
      spotifyAlbumArt: profile?.spotifyAlbumArt,
      spotifyTrackUrl: profile?.spotifyTrackUrl,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-[90vw] max-w-6xl bg-dark-gray/95 backdrop-blur-md z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Admin Panel</h2>
                <div className="flex items-center gap-2">
                  {onLogout && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onLogout}
                      className="text-red-400 hover:text-red-300"
                      title="Logout"
                    >
                      <LogOut className="h-5 w-5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Clean Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile & Content Settings */}
                <div className="space-y-6">
                  {/* Profile Settings */}
                  <Card className="bg-medium-gray/60 border-light-gray/40 shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-gaming-purple flex items-center gap-2 text-lg">
                        <User className="h-5 w-5" />
                        Profile Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Username</label>
                        <Input
                          placeholder="Your username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="bg-dark-gray border-light-gray/50 focus:border-gaming-purple text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Bio</label>
                        <Textarea
                          placeholder="Tell people about yourself"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className="bg-dark-gray border-light-gray/50 focus:border-gaming-purple resize-none text-white"
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Entrance Text</label>
                        <Input
                          placeholder="Welcome message"
                          value={entranceText}
                          onChange={(e) => setEntranceText(e.target.value)}
                          className="bg-dark-gray border-light-gray/50 focus:border-gaming-purple text-white"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-300">Font Size</label>
                          <Select value={entranceFontSize} onValueChange={setEntranceFontSize}>
                            <SelectTrigger className="bg-dark-gray border-light-gray/50 focus:border-gaming-purple text-white">
                              <SelectValue placeholder="Font size" />
                            </SelectTrigger>
                            <SelectContent className="bg-dark-gray border-light-gray/50">
                              <SelectItem value="sm">Small</SelectItem>
                              <SelectItem value="base">Base</SelectItem>
                              <SelectItem value="lg">Large</SelectItem>
                              <SelectItem value="xl">Extra Large</SelectItem>
                              <SelectItem value="2xl">2XL</SelectItem>
                              <SelectItem value="3xl">3XL</SelectItem>
                              <SelectItem value="4xl">4XL</SelectItem>
                              <SelectItem value="5xl">5XL</SelectItem>
                              <SelectItem value="6xl">6XL</SelectItem>
                              <SelectItem value="7xl">7XL</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-300">Font Family</label>
                          <Select value={entranceFontFamily} onValueChange={setEntranceFontFamily}>
                            <SelectTrigger className="bg-dark-gray border-light-gray/50 focus:border-gaming-purple text-white">
                              <SelectValue placeholder="Font family" />
                            </SelectTrigger>
                            <SelectContent className="bg-dark-gray border-light-gray/50">
                              <SelectItem value="Inter">Inter (Clean)</SelectItem>
                              <SelectItem value="Orbitron">Orbitron (Futuristic)</SelectItem>
                              <SelectItem value="Rajdhani">Rajdhani (Gaming)</SelectItem>
                              <SelectItem value="Audiowide">Audiowide (Retro)</SelectItem>
                              <SelectItem value="Bebas Neue">Bebas Neue (Bold)</SelectItem>
                              <SelectItem value="Bangers">Bangers (Comic)</SelectItem>
                              <SelectItem value="Creepster">Creepster (Horror)</SelectItem>
                              <SelectItem value="Righteous">Righteous (Strong)</SelectItem>
                              <SelectItem value="Fredoka One">Fredoka One (Friendly)</SelectItem>
                              <SelectItem value="Permanent Marker">Permanent Marker (Handwritten)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Font Color</label>
                        <div className="flex items-center gap-3">
                          <Input
                            type="color"
                            value={entranceFontColor}
                            onChange={(e) => setEntranceFontColor(e.target.value)}
                            className="w-12 h-10 bg-dark-gray border-light-gray/50 focus:border-gaming-purple rounded-md"
                          />
                          <Input
                            placeholder="Color hex code"
                            value={entranceFontColor}
                            onChange={(e) => setEntranceFontColor(e.target.value)}
                            className="flex-1 bg-dark-gray border-light-gray/50 focus:border-gaming-purple text-white"
                          />
                        </div>
                      </div>
                      
                      {/* File Upload Inputs */}
                      <input
                        type="file"
                        ref={profileUploadRef}
                        accept="image/*,image/gif"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'profile');
                        }}
                        className="hidden"
                      />
                      <input
                        type="file"
                        ref={backgroundUploadRef}
                        accept="image/*,image/gif"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'background');
                        }}
                        className="hidden"
                      />
                      
                      {/* Image Upload Section */}
                      <div className="space-y-3 pt-2">
                        <label className="text-sm font-medium text-gray-300">Images</label>
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            onClick={() => profileUploadRef.current?.click()}
                            className="bg-gaming-purple hover:bg-gaming-purple/80 text-white"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Profile Picture
                          </Button>
                          <Button
                            onClick={() => backgroundUploadRef.current?.click()}
                            className="bg-medium-gray hover:bg-light-gray text-white"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Background
                          </Button>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-2">
                        <Button
                          onClick={handleSaveProfile}
                          className="flex-1 bg-gaming-cyan hover:bg-gaming-cyan/80 text-white font-medium"
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
                        </Button>
                        <Button
                          onClick={handleRemoveBackground}
                          variant="destructive"
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove BG
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Username Effects */}
                  <Card className="bg-medium-gray/60 border-light-gray/40 shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-gaming-purple flex items-center gap-2 text-lg">
                        <Wand2 className="h-5 w-5" />
                        Username Effects
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Effect Style</label>
                        <Select value={usernameEffect} onValueChange={setUsernameEffect}>
                          <SelectTrigger className="bg-dark-gray border-light-gray/50 focus:border-gaming-purple text-white">
                            <SelectValue placeholder="Select effect" />
                          </SelectTrigger>
                          <SelectContent className="bg-dark-gray border-light-gray/50">
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="rainbow">Rainbow</SelectItem>
                            <SelectItem value="glow">Glow</SelectItem>
                            <SelectItem value="neon">Neon</SelectItem>
                            <SelectItem value="fire">Fire</SelectItem>
                            <SelectItem value="ice">Ice</SelectItem>
                            <SelectItem value="sparkles">Sparkles</SelectItem>
                            <SelectItem value="typewriter">Typewriter</SelectItem>
                            <SelectItem value="glitch">Glitch</SelectItem>
                            <SelectItem value="wave">Wave</SelectItem>
                            <SelectItem value="pulse">Pulse</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Preview</label>
                        <div className="bg-dark-gray/50 p-4 rounded-lg text-center">
                          <UsernameEffects 
                            username={username || "Preview"} 
                            effect={usernameEffect} 
                            className="text-xl"
                          />
                        </div>
                      </div>
                      
                      {/* Save Username Effects Button */}
                      <div className="pt-2">
                        <Button
                          onClick={handleSaveUsernameEffects}
                          className="w-full bg-gaming-cyan hover:bg-gaming-cyan/80 text-white font-medium"
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? "Saving..." : "Save Username Effects"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Profile Effects */}
                  <Card className="bg-medium-gray/60 border-light-gray/40 shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-gaming-purple flex items-center gap-2 text-lg">
                        🎨 Profile Effects
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Effect Style</label>
                        <Select value={profileEffect} onValueChange={setProfileEffect}>
                          <SelectTrigger className="bg-dark-gray border-light-gray/50 focus:border-gaming-purple text-white">
                            <SelectValue placeholder="Select effect" />
                          </SelectTrigger>
                          <SelectContent className="bg-dark-gray border-light-gray/50">
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="snow">❄️ Snowing Winter</SelectItem>
                            <SelectItem value="rain">🌧️ Raining Summer</SelectItem>
                            <SelectItem value="leaves">🍂 Autumn Leaves</SelectItem>
                            <SelectItem value="confetti">🎊 Confetti Party</SelectItem>
                            <SelectItem value="hearts">❤️ Floating Hearts</SelectItem>
                            <SelectItem value="bubbles">🫧 Floating Bubbles</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Preview</label>
                        <div className="bg-dark-gray/50 p-4 rounded-lg text-center min-h-[80px] relative overflow-hidden">
                          <span className="text-gray-300 text-sm">Effect Preview</span>
                          {profileEffect === "snow" && (
                            <div className="absolute inset-0 pointer-events-none">
                              {Array.from({ length: 8 }, (_, i) => (
                                <div
                                  key={i}
                                  className="absolute text-white text-xs animate-pulse"
                                  style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 2}s`,
                                  }}
                                >
                                  ❄️
                                </div>
                              ))}
                            </div>
                          )}
                          {profileEffect === "rain" && (
                            <div className="absolute inset-0 pointer-events-none">
                              {Array.from({ length: 6 }, (_, i) => (
                                <div
                                  key={i}
                                  className="absolute w-px h-4 bg-gradient-to-b from-blue-300 to-transparent animate-pulse"
                                  style={{
                                    left: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 1}s`,
                                  }}
                                />
                              ))}
                            </div>
                          )}
                          {profileEffect === "hearts" && (
                            <div className="absolute inset-0 pointer-events-none">
                              {Array.from({ length: 4 }, (_, i) => (
                                <div
                                  key={i}
                                  className="absolute text-red-400 text-xs animate-bounce"
                                  style={{
                                    left: `${Math.random() * 100}%`,
                                    bottom: `${Math.random() * 50}%`,
                                    animationDelay: `${Math.random() * 2}s`,
                                  }}
                                >
                                  ❤️
                                </div>
                              ))}
                            </div>
                          )}
                          {profileEffect === "confetti" && (
                            <div className="absolute inset-0 pointer-events-none">
                              {Array.from({ length: 6 }, (_, i) => (
                                <div
                                  key={i}
                                  className="absolute w-2 h-2 animate-spin"
                                  style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'][i % 5],
                                    animationDelay: `${Math.random() * 2}s`,
                                  }}
                                />
                              ))}
                            </div>
                          )}
                          {profileEffect === "leaves" && (
                            <div className="absolute inset-0 pointer-events-none">
                              {Array.from({ length: 4 }, (_, i) => (
                                <div
                                  key={i}
                                  className="absolute text-orange-400 text-xs animate-bounce"
                                  style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 2}s`,
                                  }}
                                >
                                  🍂
                                </div>
                              ))}
                            </div>
                          )}
                          {profileEffect === "bubbles" && (
                            <div className="absolute inset-0 pointer-events-none">
                              {Array.from({ length: 4 }, (_, i) => (
                                <div
                                  key={i}
                                  className="absolute w-4 h-4 border-2 border-white/30 rounded-full animate-pulse"
                                  style={{
                                    left: `${Math.random() * 100}%`,
                                    bottom: `${Math.random() * 50}%`,
                                    animationDelay: `${Math.random() * 2}s`,
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Save Profile Effects Button */}
                      <div className="pt-2">
                        <Button
                          onClick={handleSaveProfileEffects}
                          className="w-full bg-gaming-cyan hover:bg-gaming-cyan/80 text-white font-medium"
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? "Saving..." : "Save Profile Effects"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Animated Title */}
                  <Card className="bg-medium-gray/60 border-light-gray/40 shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-gaming-cyan flex items-center gap-2 text-lg">
                        <i className="fas fa-text-height"></i>
                        Animated Title
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-300">Enable Animated Title</label>
                          <p className="text-xs text-gray-400">Add typewriter-style animated text to your browser tab</p>
                        </div>
                        <Switch
                          checked={animatedTitleEnabled}
                          onCheckedChange={setAnimatedTitleEnabled}
                          className="data-[state=checked]:bg-gaming-cyan"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Title Texts (comma separated)</label>
                        <textarea
                          placeholder="Gamer, Streamer, Content Creator"
                          value={animatedTitleTexts}
                          onChange={(e) => setAnimatedTitleTexts(e.target.value)}
                          className="w-full bg-dark-gray border-light-gray/50 focus:border-gaming-cyan text-white rounded-md p-2 resize-none"
                          rows={3}
                        />
                        <p className="text-xs text-gray-400">
                          Enter multiple titles separated by commas. These will cycle in your browser tab title.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Animation Speed (ms)</label>
                        <div className="flex items-center space-x-3">
                          <span className="text-xs text-gray-400">Fast</span>
                          <Slider
                            value={[animatedTitleSpeed]}
                            onValueChange={(value) => setAnimatedTitleSpeed(value[0])}
                            min={500}
                            max={3000}
                            step={100}
                            className="flex-1"
                          />
                          <span className="text-xs text-gray-400">Slow</span>
                        </div>
                        <p className="text-xs text-gray-400 text-center">
                          Current: {animatedTitleSpeed}ms
                        </p>
                      </div>
                      
                      <Button
                        onClick={handleSaveAnimatedTitle}
                        className="w-full bg-gaming-cyan hover:bg-gaming-cyan/80 text-white"
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? "Saving..." : "Save Animated Title"}
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Media & Integrations */}
                <div className="space-y-6">
                  {/* Music Settings */}
                  <Card className="bg-medium-gray/60 border-light-gray/40 shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-gaming-cyan flex items-center gap-2 text-lg">
                        <Music className="h-5 w-5" />
                        Background Music
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-300">Enable Music</label>
                          <p className="text-xs text-gray-400">Auto-plays when visitors enter</p>
                        </div>
                        <Switch
                          checked={musicEnabled}
                          onCheckedChange={handleToggleMusic}
                          className="data-[state=checked]:bg-gaming-cyan"
                        />
                      </div>
                      
                      <input
                        type="file"
                        ref={musicUploadRef}
                        accept="audio/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'music');
                        }}
                        className="hidden"
                      />
                      
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <Button
                            onClick={() => musicUploadRef.current?.click()}
                            className="flex-1 bg-gaming-cyan hover:bg-gaming-cyan/80 text-white"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Music
                          </Button>
                          
                          {profile?.backgroundMusic && (
                            <Button
                              onClick={handleRemoveMusic}
                              variant="destructive"
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          )}
                        </div>
                        
                        <div className="bg-dark-gray/50 p-3 rounded-lg">
                          <p className="text-xs text-gray-400">
                            Supported formats: MP3, WAV, OGG
                          </p>
                          {profile?.backgroundMusic && (
                            <p className="text-xs text-green-400 mt-1">
                              ✓ Music uploaded and ready
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Discord & Spotify Integration */}
                  <Card className="bg-medium-gray/60 border-light-gray/40 shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-indigo-400 flex items-center gap-2 text-lg">
                        <i className="fab fa-discord text-lg"></i>
                        Discord Integration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-300">Enable Discord Widget</label>
                          <p className="text-xs text-gray-400">Show your Discord Rich Presence</p>
                        </div>
                        <Switch
                          checked={discordEnabled}
                          onCheckedChange={handleToggleDiscord}
                          className="data-[state=checked]:bg-indigo-600"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Discord User ID</label>
                        <Input
                          placeholder="Your Discord User ID (e.g., 123456789012345678)"
                          value={discordUserId}
                          onChange={(e) => setDiscordUserId(e.target.value)}
                          className="bg-dark-gray border-light-gray/50 focus:border-indigo-500 text-white"
                        />
                        <div className="text-xs text-gray-400 mt-1">
                          <p>To get your Discord ID:</p>
                          <p>1. Enable Developer Mode in Discord Settings</p>
                          <p>2. Right-click your username → "Copy User ID"</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Application ID</label>
                        <Input
                          placeholder="Discord Application ID"
                          value={discordApplicationId}
                          onChange={(e) => setDiscordApplicationId(e.target.value)}
                          className="bg-dark-gray border-light-gray/50 focus:border-indigo-500 text-white"
                        />
                      </div>
                      
                      <Button
                        onClick={handleUpdateDiscordSettings}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? "Saving..." : "Save Discord Settings"}
                      </Button>
                      
                      <div className="bg-dark-gray/50 p-3 rounded-lg">
                        <p className="text-xs text-gray-400 font-medium mb-1">Quick Setup:</p>
                        <p className="text-xs text-gray-400">1. Visit discord.com/developers</p>
                        <p className="text-xs text-gray-400">2. Create new application</p>
                        <p className="text-xs text-gray-400">3. Copy Application ID</p>
                        <p className="text-xs text-gray-400">4. Get your User ID from Discord</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Spotify Integration */}
                  <Card className="bg-medium-gray/60 border-light-gray/40 shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-green-400 flex items-center gap-2 text-lg">
                        <i className="fab fa-spotify text-lg"></i>
                        Spotify Integration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-300">Enable Spotify Widget</label>
                          <p className="text-xs text-gray-400">Show your current track</p>
                        </div>
                        <Switch
                          checked={spotifyEnabled}
                          onCheckedChange={handleToggleSpotify}
                          className="data-[state=checked]:bg-green-600"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-300">Track Name</label>
                          <Input
                            placeholder="Song title"
                            value={spotifyTrackName}
                            onChange={(e) => setSpotifyTrackName(e.target.value)}
                            className="bg-dark-gray border-light-gray/50 focus:border-green-500 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-300">Artist Name</label>
                          <Input
                            placeholder="Artist name"
                            value={spotifyArtistName}
                            onChange={(e) => setSpotifyArtistName(e.target.value)}
                            className="bg-dark-gray border-light-gray/50 focus:border-green-500 text-white"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Spotify Track URL</label>
                        <Input
                          placeholder="https://open.spotify.com/track/..."
                          value={spotifyTrackUrl}
                          onChange={(e) => setSpotifyTrackUrl(e.target.value)}
                          className="bg-dark-gray border-light-gray/50 focus:border-green-500 text-white"
                        />
                      </div>
                      
                      <input
                        type="file"
                        ref={spotifyAlbumUploadRef}
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'spotify-album');
                        }}
                        className="hidden"
                      />
                      
                      <div className="flex gap-3">
                        <Button
                          onClick={() => spotifyAlbumUploadRef.current?.click()}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Album Art
                        </Button>
                        <Button
                          onClick={handleUpdateSpotifySettings}
                          className="flex-1 bg-gaming-cyan hover:bg-gaming-cyan/80 text-white"
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Links Management Section */}
              <div className="mt-8">
                <Card className="bg-medium-gray/60 border-light-gray/40 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-gaming-cyan flex items-center gap-2 text-lg">
                      <ExternalLink className="h-5 w-5" />
                      Social Media Links
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-gray-300 text-sm">
                        Manage your social media links and platform connections
                      </p>
                      <Button
                        onClick={onNewLink}
                        className="bg-gaming-purple hover:bg-gaming-purple/80 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Link
                      </Button>
                    </div>
                    
                    <div className="grid gap-3">
                      {links.map((link) => (
                        <div
                          key={link.id}
                          className="flex items-center justify-between bg-dark-gray/50 p-3 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${link.color}`}>
                              <i className={`${link.icon} text-white text-sm`}></i>
                            </div>
                            <div>
                              <p className="text-white font-medium">{link.title}</p>
                              <p className="text-gray-400 text-xs">{link.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => onEditLink(link)}
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-white"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteLink(link.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}