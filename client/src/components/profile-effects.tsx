import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ProfileEffectsProps {
  effect: string;
  className?: string;
}

export default function ProfileEffects({ effect, className = "" }: ProfileEffectsProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; duration: number; size?: number; color?: string }>>([]);

  useEffect(() => {
    if (effect === 'none') {
      setParticles([]);
      return;
    }

    const generateParticles = () => {
      const newParticles = [];
      let count = 0;
      
      switch (effect) {
        case 'snow':
          count = 80;
          for (let i = 0; i < count; i++) {
            newParticles.push({
              id: i,
              x: Math.random() * 100,
              y: -10,
              delay: Math.random() * 8,
              duration: 12 + Math.random() * 8,
              size: 2 + Math.random() * 4,
            });
          }
          break;
          
        case 'rain':
          count = 120;
          for (let i = 0; i < count; i++) {
            newParticles.push({
              id: i,
              x: Math.random() * 100,
              y: -10,
              delay: Math.random() * 2,
              duration: 1.5 + Math.random() * 1.5,
              size: 1 + Math.random() * 2,
            });
          }
          break;
          
        case 'leaves':
          count = 30;
          for (let i = 0; i < count; i++) {
            const colors = ['#ff6b35', '#ff8c42', '#ffd662', '#e67e22', '#d35400'];
            newParticles.push({
              id: i,
              x: Math.random() * 100,
              y: -10,
              delay: Math.random() * 5,
              duration: 10 + Math.random() * 5,
              size: 12 + Math.random() * 8,
              color: colors[Math.floor(Math.random() * colors.length)],
            });
          }
          break;
          
        case 'confetti':
          count = 40;
          for (let i = 0; i < count; i++) {
            const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
            newParticles.push({
              id: i,
              x: Math.random() * 100,
              y: -10,
              delay: Math.random() * 3,
              duration: 4 + Math.random() * 3,
              size: 6 + Math.random() * 6,
              color: colors[Math.floor(Math.random() * colors.length)],
            });
          }
          break;
          
        case 'hearts':
          count = 25;
          for (let i = 0; i < count; i++) {
            newParticles.push({
              id: i,
              x: Math.random() * 100,
              y: 110,
              delay: Math.random() * 4,
              duration: 8 + Math.random() * 4,
              size: 16 + Math.random() * 8,
            });
          }
          break;
          
        case 'bubbles':
          count = 30;
          for (let i = 0; i < count; i++) {
            newParticles.push({
              id: i,
              x: Math.random() * 100,
              y: 110,
              delay: Math.random() * 4,
              duration: 10 + Math.random() * 5,
              size: 20 + Math.random() * 30,
            });
          }
          break;
      }
      
      setParticles(newParticles);
    };

    generateParticles();
    
    // Regenerate particles periodically to maintain continuous effect
    const interval = setInterval(generateParticles, 8000);
    return () => clearInterval(interval);
  }, [effect]);

  if (effect === 'none' || particles.length === 0) {
    return null;
  }

  return (
    <div className={`fixed inset-0 pointer-events-none z-10 overflow-hidden ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.x}%`,
            fontSize: `${particle.size}px`,
          }}
          initial={{
            y: effect === 'hearts' || effect === 'bubbles' ? particle.y : -20,
            opacity: 0,
            rotate: 0,
          }}
          animate={{
            y: effect === 'hearts' || effect === 'bubbles' ? -100 : window.innerHeight + 100,
            opacity: [0, 1, 1, 0],
            rotate: effect === 'leaves' ? 720 : effect === 'confetti' ? 360 : 0,
            x: effect === 'snow' ? [0, 30, -30, 0] : 0,
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {effect === 'snow' && (
            <div
              className="bg-white rounded-full opacity-80"
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)',
                background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 70%, rgba(255,255,255,0.3) 100%)',
              }}
            />
          )}
          {effect === 'rain' && (
            <div 
              className="opacity-70"
              style={{
                width: '1px',
                height: `${particle.size * 6}px`,
                background: 'linear-gradient(to bottom, rgba(173,216,230,0.9), rgba(135,206,235,0.7), rgba(100,149,237,0.4))',
                borderRadius: '50px',
                boxShadow: '0 0 2px rgba(173,216,230,0.5)',
              }}
            />
          )}
          {effect === 'leaves' && (
            <div
              className="rounded-full opacity-80"
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                background: particle.color,
                borderRadius: '0 100% 0 100%',
                transform: 'rotate(45deg)',
              }}
            />
          )}
          {effect === 'confetti' && (
            <div
              className="opacity-90"
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                background: particle.color,
                borderRadius: '2px',
              }}
            />
          )}
          {effect === 'hearts' && (
            <span className="text-red-400 opacity-70">❤️</span>
          )}
          {effect === 'bubbles' && (
            <div
              className="border-2 border-white opacity-30 rounded-full"
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                background: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.3)',
              }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}