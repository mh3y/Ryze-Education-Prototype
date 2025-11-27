
import React, { useEffect, useRef, memo } from 'react';
import { motion } from 'framer-motion';

export const Starfield: React.FC = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationId: number;
    
    // Configuration
    const STAR_COUNT_DESKTOP = 450;
    const STAR_COUNT_MOBILE = 100;
    const SHOOTING_STAR_PROBABILITY = 0.03;
    const SHOOTING_STAR_TIMER_THRESHOLD = 150;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    
    window.addEventListener('resize', resize);
    resize();

    interface Star {
      x: number;
      y: number;
      size: number;
      opacity: number;
      baseOpacity: number;
      speed: number;
      twinkleSpeed: number;
      twinklePhase: number;
      color: string;
    }

    interface ShootingStar {
      x: number;
      y: number;
      len: number;
      speed: number;
      opacity: number;
    }

    const stars: Star[] = [];
    const shootingStars: ShootingStar[] = [];
    let shootingStarTimer = 0;
    
    const initStars = () => {
      stars.length = 0;
      const isDesktop = width >= 1024;
      const isTablet = width >= 768;
      const count = isDesktop ? STAR_COUNT_DESKTOP : isTablet ? 250 : STAR_COUNT_MOBILE;

      for (let i = 0; i < count; i++) {
        const baseOpacity = Math.random() * 0.5 + 0.1;
        const isGold = Math.random() < 0.15; // 15% chance for gold star
        
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.5 + 0.5,
          baseOpacity,
          opacity: 0,
          speed: Math.random() * 0.05, // Very slow drift
          twinkleSpeed: 0.02 + Math.random() * 0.05,
          twinklePhase: Math.random() * Math.PI * 2,
          color: isGold ? `255, 176, 0` : `200, 220, 255`
        });
      }
    };
    
    initStars();

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw Stars
      stars.forEach(star => {
        star.twinklePhase += star.twinkleSpeed;
        const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7; 
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${star.color}, ${star.baseOpacity * twinkle})`;
        ctx.fill();

        // Subtle Parallax/Drift
        star.y -= star.speed;
        if (star.y < -5) star.y = height + 5;
      });

      // Handle Shooting Stars
      shootingStarTimer++;
      if (shootingStarTimer > SHOOTING_STAR_TIMER_THRESHOLD && Math.random() < SHOOTING_STAR_PROBABILITY) {
         shootingStarTimer = 0;
         shootingStars.push({
            x: Math.random() * width,
            y: Math.random() * (height * 0.6),
            len: Math.random() * 80 + 50,
            speed: Math.random() * 15 + 10,
            opacity: 1
         });
      }

      shootingStars.forEach((star, i) => {
         star.x += star.speed;
         star.y += star.speed * 0.4;
         star.opacity -= 0.02;

         if (star.opacity <= 0) {
            shootingStars.splice(i, 1);
         } else {
            ctx.beginPath();
            // Gradient tail
            const grad = ctx.createLinearGradient(star.x, star.y, star.x - star.len, star.y - star.len * 0.4);
            grad.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.strokeStyle = grad;
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(star.x - star.len, star.y - star.len * 0.4);
            ctx.stroke();
         }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#050510]">
      {/* 1. Radial Vignette for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_90%)] opacity-80 z-10"></div>
      
      {/* 2. Canvas Stars & Shooting Stars */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-20" />
    </div>
  );
});
