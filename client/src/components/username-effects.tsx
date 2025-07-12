import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface UsernameEffectsProps {
  username: string;
  effect: string;
  className?: string;
}

export default function UsernameEffects({ username, effect, className = "" }: UsernameEffectsProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  // Typewriter effect
  useEffect(() => {
    if (effect === "typewriter") {
      setDisplayText("");
      setCurrentIndex(0);
      
      const interval = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= username.length) {
            clearInterval(interval);
            return prev;
          }
          setDisplayText(username.slice(0, prev + 1));
          return prev + 1;
        });
      }, 150);

      return () => clearInterval(interval);
    }
  }, [username, effect]);

  // Sparkle positions for sparkle effects
  const sparklePositions = [
    { x: -5, y: -5 },
    { x: 15, y: -8 },
    { x: -8, y: 8 },
    { x: 12, y: 12 },
    { x: -12, y: 0 },
    { x: 0, y: -12 },
  ];

  const renderSparkles = (color: string) => (
    <div className="absolute inset-0 pointer-events-none">
      {sparklePositions.map((pos, index) => (
        <motion.div
          key={index}
          className="absolute w-1 h-1 rounded-full"
          style={{
            backgroundColor: color,
            left: `${50 + pos.x}%`,
            top: `${50 + pos.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: index * 0.3,
          }}
        />
      ))}
    </div>
  );

  const getEffectStyles = () => {
    switch (effect) {
      case "rainbow":
        return {
          background: "linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)",
          backgroundSize: "200% 200%",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "rainbow 3s ease infinite",
        };
      case "glow":
        return {
          color: "#ffffff",
          textShadow: "0 0 10px #7c3aed, 0 0 20px #7c3aed, 0 0 40px #7c3aed",
          animation: "glow 2s ease-in-out infinite alternate",
        };
      case "neon":
        return {
          color: "#00ffff",
          textShadow: "0 0 5px #00ffff, 0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 40px #00ffff",
          animation: "neon 1.5s ease-in-out infinite alternate",
        };
      case "fire":
        return {
          background: "linear-gradient(45deg, #ff4500, #ff6347, #ffa500, #ff0000)",
          backgroundSize: "200% 200%",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "fire 2s ease infinite",
        };
      case "ice":
        return {
          color: "#87ceeb",
          textShadow: "0 0 10px #87ceeb, 0 0 20px #4682b4, 0 0 40px #4682b4",
          animation: "ice 3s ease-in-out infinite alternate",
        };
      case "sparkles":
        return {
          color: "#ffffff",
          textShadow: "0 0 10px #7c3aed, 0 0 20px #7c3aed",
          position: "relative",
        };
      case "glitch":
        return {
          color: "#00ff00",
          textShadow: "0 0 5px #00ff00, 0 0 10px #00ff00",
          animation: "glitch 0.5s ease-in-out infinite",
        };
      case "wave":
        return {
          display: "inline-block",
        };
      case "pulse":
        return {
          display: "inline-block",
        };
      default:
        return {};
    }
  };

  const textToShow = effect === "typewriter" ? displayText : username;

  // For wave and pulse effects, render each character individually
  const renderCharacterEffect = (text: string, effectType: string) => {
    return text.split('').map((char, index) => (
      <span
        key={index}
        style={{
          display: "inline-block",
          animationName: effectType,
          animationDuration: "2s",
          animationTimingFunction: "ease-in-out",
          animationIterationCount: "infinite",
          animationDelay: `${index * 0.1}s`,
        }}
      >
        {char}
      </span>
    ));
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {(effect === "wave" || effect === "pulse") ? (
        <span style={{ display: "inline-block" }}>
          {renderCharacterEffect(textToShow, effect)}
        </span>
      ) : (
        <span style={getEffectStyles()}>
          {textToShow}
          {effect === "typewriter" && currentIndex < username.length && (
            <span className="animate-pulse">|</span>
          )}
        </span>
      )}
      
      {effect === "white-sparkles" && renderSparkles("#ffffff")}
      {effect === "colored-sparkles" && renderSparkles("#7c3aed")}
      {effect === "rainbow-sparkles" && renderSparkles("#ff00ff")}
    </div>
  );
}