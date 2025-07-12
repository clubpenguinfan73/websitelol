import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Trash2, Plus, Edit, LogOut, Music, Volume2, VolumeX, User, Image, ExternalLink, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
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
  const [musicEnabled, setMusicEnabled] = useState(profile?.musicEnabled || false);
  const [discordEnabled, setDiscordEnabled] = useState(profile?.discordEnabled || false);
  const [discordUserId, setDiscordUserId] = useState(profile?.discordUserId || "");
  const [discordApplicationId, setDiscordApplicationId] = useState(profile?.discordApplicationId || "");
  const [spotifyEnabled, setSpotifyEnabled] = useState(profile?.spotifyEnabled || false);
  const [spotifyTrackName, setSpotifyTrackName] = useState(profile?.spotifyTrackName || "");
  const [spotifyArtistName, setSpotifyArtistName] = useState(profile?.spotifyArtistName || "");
  const [spotifyAlbumArt, setSpotifyAlbumArt] = useState(profile?.spotifyAlbumArt || "");
  const [spotifyTrackUrl, setSpotifyTrackUrl] = useState(profile?.spotifyTrackUrl || "");
  const backgroundUploadRef = useRef<HTMLInputElement>(null);
  const profileUploadRef = useRef<HTMLInputElement>(null);
  const musicUploadRef = useRef<HTMLInputElement>(null);
  const spotifyAlbumUploadRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: Partial<Profile>) => {
      const response = await apiRequest("PUT", "/api/profile", profileData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async (linkId: number) => {
      await apiRequest("DELETE", `/api/links/${linkId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      toast({
        title: "Link deleted",
        description: "The link has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete link. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (file: File, type: 'background' | 'profile') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      updateProfileMutation.mutate({
        username: profile?.username || "",
        bio: profile?.bio || "",
        profilePicture: type === 'profile' ? result : profile?.profilePicture,
        backgroundImage: type === 'background' ? result : profile?.backgroundImage,
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
    reader.readAsDataURL(file);
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, 'background');
    }
  };

  const handleProfileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, 'profile');
    }
  };

  const handleMusicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        updateProfileMutation.mutate({
          username: profile?.username || "",
          bio: profile?.bio || "",
          profilePicture: profile?.profilePicture,
          backgroundImage: profile?.backgroundImage,
          backgroundMusic: result,
          musicEnabled: true,
          discordEnabled: profile?.discordEnabled,
          discordUserId: profile?.discordUserId,
          discordApplicationId: profile?.discordApplicationId,
          spotifyEnabled: profile?.spotifyEnabled,
          spotifyTrackName: profile?.spotifyTrackName,
          spotifyArtistName: profile?.spotifyArtistName,
          spotifyAlbumArt: profile?.spotifyAlbumArt,
          spotifyTrackUrl: profile?.spotifyTrackUrl,
        });
        setMusicEnabled(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSpotifyAlbumUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSpotifyAlbumArt(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBackground = () => {
    updateProfileMutation.mutate({
      username: profile?.username || "",
      bio: profile?.bio || "",
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

  const handleToggleMusic = (enabled: boolean) => {
    setMusicEnabled(enabled);
    updateProfileMutation.mutate({
      username: profile?.username || "",
      bio: profile?.bio || "",
      profilePicture: profile?.profilePicture,
      backgroundImage: profile?.backgroundImage,
      backgroundMusic: profile?.backgroundMusic,
      musicEnabled: enabled,
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

  const handleRemoveMusic = () => {
    updateProfileMutation.mutate({
      username: profile?.username || "",
      bio: profile?.bio || "",
      profilePicture: profile?.profilePicture,
      backgroundImage: profile?.backgroundImage,
      backgroundMusic: null,
      musicEnabled: false,
      discordEnabled: profile?.discordEnabled,
      discordUserId: profile?.discordUserId,
      discordApplicationId: profile?.discordApplicationId,
      spotifyEnabled: profile?.spotifyEnabled,
      spotifyTrackName: profile?.spotifyTrackName,
      spotifyArtistName: profile?.spotifyArtistName,
      spotifyAlbumArt: profile?.spotifyAlbumArt,
      spotifyTrackUrl: profile?.spotifyTrackUrl,
    });
    setMusicEnabled(false);
  };

  const handleUpdateText = () => {
    updateProfileMutation.mutate({
      username,
      bio,
      profilePicture: profile?.profilePicture,
      backgroundImage: profile?.backgroundImage,
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

  const handleToggleDiscord = (enabled: boolean) => {
    setDiscordEnabled(enabled);
    updateProfileMutation.mutate({
      username: profile?.username || "",
      bio: profile?.bio || "",
      profilePicture: profile?.profilePicture,
      backgroundImage: profile?.backgroundImage,
      backgroundMusic: profile?.backgroundMusic,
      musicEnabled: profile?.musicEnabled,
      discordEnabled: enabled,
      discordUserId: profile?.discordUserId,
      discordApplicationId: profile?.discordApplicationId,
      spotifyEnabled: profile?.spotifyEnabled,
      spotifyTrackName: profile?.spotifyTrackName,
      spotifyArtistName: profile?.spotifyArtistName,
      spotifyAlbumArt: profile?.spotifyAlbumArt,
      spotifyTrackUrl: profile?.spotifyTrackUrl,
    });
  };

  const handleToggleSpotify = (enabled: boolean) => {
    setSpotifyEnabled(enabled);
    updateProfileMutation.mutate({
      username: profile?.username || "",
      bio: profile?.bio || "",
      profilePicture: profile?.profilePicture,
      backgroundImage: profile?.backgroundImage,
      backgroundMusic: profile?.backgroundMusic,
      musicEnabled: profile?.musicEnabled,
      discordEnabled: profile?.discordEnabled,
      discordUserId: profile?.discordUserId,
      discordApplicationId: profile?.discordApplicationId,
      spotifyEnabled: enabled,
      spotifyTrackName: profile?.spotifyTrackName,
      spotifyArtistName: profile?.spotifyArtistName,
      spotifyAlbumArt: profile?.spotifyAlbumArt,
      spotifyTrackUrl: profile?.spotifyTrackUrl,
    });
  };

  const handleUpdateDiscordSettings = () => {
    updateProfileMutation.mutate({
      username: profile?.username || "",
      bio: profile?.bio || "",
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
      username: profile?.username || "",
      bio: profile?.bio || "",
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

  const handleDeleteLink = (linkId: number) => {
    deleteLinkMutation.mutate(linkId);
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

              {/* Multi-column Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Profile Settings */}
                  <Card className="bg-medium-gray/50 border-light-gray/30">
                    <CardHeader>
                      <CardTitle className="text-gaming-purple flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Profile
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Input
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="bg-medium-gray border-light-gray focus:border-gaming-purple"
                      />
                      <Textarea
                        placeholder="Bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="bg-medium-gray border-light-gray focus:border-gaming-purple resize-none"
                        rows={3}
                      />
                      <input
                        type="file"
                        ref={profileUploadRef}
                        accept="image/*,image/gif"
                        onChange={handleProfileUpload}
                        className="hidden"
                      />
                      <Button
                        onClick={() => profileUploadRef.current?.click()}
                        className="w-full bg-gaming-purple hover:bg-gaming-purple/80 text-sm"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Profile Picture
                      </Button>
                      <Button
                        onClick={handleSaveProfile}
                        className="w-full bg-gaming-cyan hover:bg-gaming-cyan/80 text-sm"
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Background & Music Settings */}
                  <Card className="bg-medium-gray/50 border-light-gray/30">
                    <CardHeader>
                      <CardTitle className="text-gaming-purple flex items-center gap-2">
                        <Image className="h-5 w-5" />
                        Background & Music
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <input
                        type="file"
                        ref={backgroundUploadRef}
                        accept="image/*,image/gif"
                        onChange={handleBackgroundUpload}
                        className="hidden"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => backgroundUploadRef.current?.click()}
                          className="flex-1 bg-medium-gray hover:bg-light-gray text-sm"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                        <Button
                          onClick={handleRemoveBackground}
                          variant="destructive"
                          className="flex-1 text-sm"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                      
                      <div className="border-t border-light-gray/20 pt-3">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-white text-sm flex items-center gap-2">
                            <Music className="h-4 w-4 text-gaming-cyan" />
                            Background Music
                          </span>
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
                          onChange={handleMusicUpload}
                          className="hidden"
                        />
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={() => musicUploadRef.current?.click()}
                            className="flex-1 bg-medium-gray hover:bg-light-gray text-sm"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                          </Button>
                          
                          {profile?.backgroundMusic && (
                            <Button
                              onClick={handleRemoveMusic}
                              variant="destructive"
                              className="flex-1 text-sm"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          )}
                        </div>
                        
                        <div className="text-xs text-gray-400 mt-2">
                          MP3, WAV, OGG
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Middle Column */}
                <div className="space-y-6">
                  {/* Discord Rich Presence Settings */}
                  <Card className="bg-medium-gray/50 border-light-gray/30">
                    <CardHeader>
                      <CardTitle className="text-indigo-400 flex items-center gap-2">
                        <i className="fab fa-discord text-lg"></i>
                        Discord Rich Presence
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm">Enable Discord Widget</span>
                        <Switch
                          checked={discordEnabled}
                          onCheckedChange={handleToggleDiscord}
                          className="data-[state=checked]:bg-indigo-600"
                        />
                      </div>
                      
                      <Input
                        placeholder="Discord User ID"
                        value={discordUserId}
                        onChange={(e) => setDiscordUserId(e.target.value)}
                        className="bg-medium-gray border-light-gray focus:border-indigo-500"
                      />
                      
                      <Input
                        placeholder="Discord Application ID"
                        value={discordApplicationId}
                        onChange={(e) => setDiscordApplicationId(e.target.value)}
                        className="bg-medium-gray border-light-gray focus:border-indigo-500"
                      />
                      
                      <Button
                        onClick={handleUpdateDiscordSettings}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-sm"
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? "Saving..." : "Save Discord Settings"}
                      </Button>
                      
                      <div className="text-xs text-gray-400 bg-medium-gray/30 rounded p-2">
                        <p className="font-medium mb-1">Setup:</p>
                        <p>1. discord.com/developers</p>
                        <p>2. Create application</p>
                        <p>3. Copy Application ID</p>
                        <p>4. Get User ID from Discord</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Spotify Settings */}
                  <Card className="bg-medium-gray/50 border-light-gray/30">
                    <CardHeader>
                      <CardTitle className="text-green-400 flex items-center gap-2">
                        <i className="fab fa-spotify text-lg"></i>
                        Spotify Integration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm">Enable Spotify Widget</span>
                        <Switch
                          checked={spotifyEnabled}
                          onCheckedChange={handleToggleSpotify}
                          className="data-[state=checked]:bg-green-600"
                        />
                      </div>
                      
                      <Input
                        placeholder="Track Name"
                        value={spotifyTrackName}
                        onChange={(e) => setSpotifyTrackName(e.target.value)}
                        className="bg-medium-gray border-light-gray focus:border-green-500"
                      />
                      
                      <Input
                        placeholder="Artist Name"
                        value={spotifyArtistName}
                        onChange={(e) => setSpotifyArtistName(e.target.value)}
                        className="bg-medium-gray border-light-gray focus:border-green-500"
                      />
                      
                      <Input
                        placeholder="Spotify Track URL"
                        value={spotifyTrackUrl}
                        onChange={(e) => setSpotifyTrackUrl(e.target.value)}
                        className="bg-medium-gray border-light-gray focus:border-green-500"
                      />
                      
                      <input
                        type="file"
                        ref={spotifyAlbumUploadRef}
                        accept="image/*"
                        onChange={handleSpotifyAlbumUpload}
                        className="hidden"
                      />
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => spotifyAlbumUploadRef.current?.click()}
                          className="flex-1 bg-medium-gray hover:bg-light-gray text-sm"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Album Art
                        </Button>
                        <Button
                          onClick={() => setSpotifyAlbumArt("")}
                          variant="destructive"
                          className="flex-1 text-sm"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                      
                      <Button
                        onClick={handleUpdateSpotifySettings}
                        className="w-full bg-green-600 hover:bg-green-700 text-sm"
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? "Saving..." : "Save Spotify Settings"}
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Links Management */}
                  <Card className="bg-medium-gray/50 border-light-gray/30">
                    <CardHeader>
                      <CardTitle className="text-gaming-purple flex items-center gap-2">
                        <ExternalLink className="h-5 w-5" />
                        Social Links
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button
                        onClick={onNewLink}
                        className="w-full bg-gaming-purple hover:bg-gaming-purple/80 text-sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Link
                      </Button>
                      
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {links.map((link) => (
                          <div
                            key={link.id}
                            className="flex items-center justify-between p-3 bg-medium-gray/30 rounded-md"
                          >
                            <div className="flex items-center gap-3">
                              <i className={`fab fa-${link.title.toLowerCase()} text-gaming-purple`}></i>
                              <span className="text-white font-medium text-sm">{link.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEditLink(link)}
                                className="text-gaming-cyan hover:text-gaming-cyan/80"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteLink(link.id)}
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
            </div>

              {/* Website Music Settings */}
              <Card className="mb-6 bg-medium-gray/50 border-light-gray/30">
                <CardHeader>
                  <CardTitle className="text-gaming-cyan flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    Website Music
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm">Enable Background Music</span>
                    <Switch
                      checked={musicEnabled}
                      onCheckedChange={handleToggleMusic}
                      className="data-[state=checked]:bg-gaming-purple"
                    />
                  </div>
                  
                  <input
                    type="file"
                    ref={musicUploadRef}
                    accept="audio/*"
                    onChange={handleMusicUpload}
                    className="hidden"
                  />
                  
                  <Button
                    onClick={() => musicUploadRef.current?.click()}
                    className="w-full bg-medium-gray hover:bg-light-gray text-sm"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Music
                  </Button>
                  
                  {profile?.backgroundMusic && (
                    <Button
                      onClick={handleRemoveMusic}
                      variant="destructive"
                      className="w-full"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove Music
                    </Button>
                  )}
                  
                  <div className="text-xs text-gray-400">
                    Supported formats: MP3, WAV, OGG
                  </div>
                </CardContent>
              </Card>

              {/* Discord Rich Presence Settings */}
              <Card className="mb-6 bg-medium-gray/50 border-light-gray/30">
                <CardHeader>
                  <CardTitle className="text-indigo-400 flex items-center gap-2">
                    <i className="fab fa-discord text-lg"></i>
                    Discord Rich Presence
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm">Enable Discord Rich Presence</span>
                    <Switch
                      checked={discordEnabled}
                      onCheckedChange={handleToggleDiscord}
                      className="data-[state=checked]:bg-indigo-600"
                    />
                  </div>
                  
                  <Input
                    placeholder="Discord User ID"
                    value={discordUserId}
                    onChange={(e) => setDiscordUserId(e.target.value)}
                    className="bg-medium-gray border-light-gray focus:border-indigo-500"
                  />
                  
                  <Input
                    placeholder="Discord Application ID"
                    value={discordApplicationId}
                    onChange={(e) => setDiscordApplicationId(e.target.value)}
                    className="bg-medium-gray border-light-gray focus:border-indigo-500"
                  />
                  
                  <Button
                    onClick={handleUpdateDiscordSettings}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-sm"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? "Saving..." : "Save Discord Settings"}
                  </Button>
                  
                  <div className="text-xs text-gray-400">
                    <p>To set up Discord Rich Presence:</p>
                    <p>1. Create a Discord application at discord.com/developers</p>
                    <p>2. Copy your Application ID</p>
                    <p>3. Find your User ID in Discord settings</p>
                  </div>
                </CardContent>
              </Card>

              {/* Spotify Settings */}
              <Card className="mb-6 bg-medium-gray/50 border-light-gray/30">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <i className="fab fa-spotify text-lg"></i>
                    Spotify Integration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm">Enable Spotify Widget</span>
                    <Switch
                      checked={spotifyEnabled}
                      onCheckedChange={handleToggleSpotify}
                      className="data-[state=checked]:bg-green-600"
                    />
                  </div>
                  
                  <Input
                    placeholder="Track Name"
                    value={spotifyTrackName}
                    onChange={(e) => setSpotifyTrackName(e.target.value)}
                    className="bg-medium-gray border-light-gray focus:border-green-500"
                  />
                  
                  <Input
                    placeholder="Artist Name"
                    value={spotifyArtistName}
                    onChange={(e) => setSpotifyArtistName(e.target.value)}
                    className="bg-medium-gray border-light-gray focus:border-green-500"
                  />
                  
                  <Input
                    placeholder="Spotify Track URL"
                    value={spotifyTrackUrl}
                    onChange={(e) => setSpotifyTrackUrl(e.target.value)}
                    className="bg-medium-gray border-light-gray focus:border-green-500"
                  />
                  
                  <input
                    type="file"
                    ref={spotifyAlbumUploadRef}
                    accept="image/*"
                    onChange={handleSpotifyAlbumUpload}
                    className="hidden"
                  />
                  
                  <Button
                    onClick={() => spotifyAlbumUploadRef.current?.click()}
                    className="w-full bg-medium-gray hover:bg-light-gray text-sm"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Album Art
                  </Button>
                  
                  <Button
                    onClick={handleUpdateSpotifySettings}
                    className="w-full bg-green-600 hover:bg-green-700 text-sm"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? "Saving..." : "Save Spotify Settings"}
                  </Button>
                  
                  <div className="text-xs text-gray-400">
                    Customize your Spotify widget with track info and album art
                  </div>
                </CardContent>
              </Card>

              {/* Profile Settings */}
              <Card className="mb-6 bg-medium-gray/50 border-light-gray/30">
                <CardHeader>
                  <CardTitle className="text-gaming-cyan">Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <input
                    type="file"
                    ref={profileUploadRef}
                    accept="image/*"
                    onChange={handleProfileUpload}
                    className="hidden"
                  />
                  <Button
                    onClick={() => profileUploadRef.current?.click()}
                    className="w-full bg-medium-gray hover:bg-light-gray"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Change Profile Picture
                  </Button>
                  <Input
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-medium-gray border-light-gray focus:border-gaming-purple"
                  />
                  <Textarea
                    placeholder="Bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="bg-medium-gray border-light-gray focus:border-gaming-purple resize-none"
                    rows={3}
                  />
                  <Button
                    onClick={handleUpdateText}
                    className="w-full bg-gaming-purple hover:bg-gaming-purple/80"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>

              {/* Links Management */}
              <Card className="bg-medium-gray/50 border-light-gray/30">
                <CardHeader>
                  <CardTitle className="text-white">Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 mb-4">
                    {links.map((link) => (
                      <div key={link.id} className="flex items-center justify-between p-2 bg-light-gray/30 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <i className={`${link.icon} text-white text-sm`}></i>
                          <span className="text-white text-sm">{link.title}</span>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditLink(link)}
                            className="text-gray-400 hover:text-white p-1"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLink(link.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                            disabled={deleteLinkMutation.isPending}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={onNewLink}
                    className="w-full bg-gaming-purple hover:bg-gaming-purple/80"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Link
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
