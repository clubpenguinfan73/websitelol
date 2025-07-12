import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import EntranceOverlay from "@/components/entrance-overlay";
import MainContent from "@/components/main-content";
import AdminPanel from "@/components/admin-panel-new";
import LinkEditModal from "@/components/link-edit-modal";
import LoginModal from "@/components/login-modal";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { Profile, Link } from "@shared/schema";

export default function Home() {
  const [showEntrance, setShowEntrance] = useState(true);
  const [isEntering, setIsEntering] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { data: profile, isLoading: profileLoading } = useQuery<Profile>({
    queryKey: ["/api/profile"],
  });

  const { data: links = [], isLoading: linksLoading } = useQuery<Link[]>({
    queryKey: ["/api/links"],
  });

  // Check authentication status and cache background image on component mount
  useEffect(() => {
    const checkAuth = () => {
      const authToken = localStorage.getItem("admin_auth");
      const authTime = localStorage.getItem("admin_auth_time");
      
      if (authToken && authTime) {
        const timeDiff = Date.now() - parseInt(authTime);
        // Session expires after 24 hours
        if (timeDiff < 24 * 60 * 60 * 1000) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("admin_auth");
          localStorage.removeItem("admin_auth_time");
          setIsAuthenticated(false);
        }
      }
    };
    
    checkAuth();
  }, []);



  const handleEnter = () => {
    setIsEntering(true);
    setTimeout(() => {
      setShowEntrance(false);
      setIsEntering(false);
    }, 1000);
  };

  const handleEditLink = (link: Link) => {
    setEditingLink(link);
    setShowLinkModal(true);
  };

  const handleNewLink = () => {
    setEditingLink(null);
    setShowLinkModal(true);
  };

  const handleCloseLinkModal = () => {
    setShowLinkModal(false);
    setEditingLink(null);
  };

  const handleAdminAccess = () => {
    if (isAuthenticated) {
      setShowAdminPanel(true);
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setShowAdminPanel(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    localStorage.removeItem("admin_auth_time");
    setIsAuthenticated(false);
    setShowAdminPanel(false);
  };

  // Show loading screen while data loads
  if (profileLoading || linksLoading) {
    return (
      <div className="fixed inset-0 z-50">
        {/* Background matching the main theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-gaming-purple/20 via-black to-gaming-cyan/20"></div>
      </div>
    );
  }

  if (showEntrance) {
    return <EntranceOverlay onEnter={handleEnter} isEntering={isEntering} profile={profile} />;
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <MainContent 
        profile={profile}
        links={links}
        onToggleAdmin={handleAdminAccess}
        onEditLink={handleEditLink}
      />
      
      <AdminPanel 
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
        profile={profile}
        links={links}
        onNewLink={handleNewLink}
        onEditLink={handleEditLink}
        onLogout={handleLogout}
      />
      
      <LinkEditModal 
        isOpen={showLinkModal}
        onClose={handleCloseLinkModal}
        link={editingLink}
      />
      
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
