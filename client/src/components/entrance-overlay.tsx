import { motion } from "framer-motion";
import type { Profile } from "@shared/schema";

interface EntranceOverlayProps {
  onEnter: () => void;
  isEntering: boolean;
  profile?: Profile;
}

export default function EntranceOverlay({ onEnter, isEntering, profile }: EntranceOverlayProps) {
  // Don't render if profile data hasn't loaded yet
  if (!profile) {
    return null;
  }

  const backgroundImage = profile?.backgroundImage;
  const entranceText = profile?.entranceText || "click to enter...";
  const fontSize = profile?.entranceFontSize || "4xl";
  const fontFamily = profile?.entranceFontFamily || "Inter";
  const fontColor = profile?.entranceFontColor || "#ffffff";

  // Map font size to Tailwind classes
  const fontSizeClasses = {
    "sm": "text-sm md:text-lg",
    "base": "text-base md:text-xl",
    "lg": "text-lg md:text-2xl",
    "xl": "text-xl md:text-3xl",
    "2xl": "text-2xl md:text-4xl",
    "3xl": "text-3xl md:text-5xl",
    "4xl": "text-4xl md:text-6xl",
    "5xl": "text-5xl md:text-7xl",
    "6xl": "text-6xl md:text-8xl",
    "7xl": "text-7xl md:text-9xl"
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isEntering ? 0 : 1 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer"
      onClick={onEnter}
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Blur overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Content */}
      <div className="relative text-center z-10">
        <motion.h1 
          initial={{ opacity: 0.9 }}
          animate={{ opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`${fontSizeClasses[fontSize as keyof typeof fontSizeClasses]} font-light tracking-wide`}
          style={{ 
            fontFamily: fontFamily,
            color: fontColor
          }}
        >
          {entranceText}
        </motion.h1>
      </div>
    </motion.div>
  );
}
