"use client";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

export default function FloatingHearts({ count = 22, opacity = 0.12 }) {
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    const clampedCount = Math.max(0, Math.min(80, Number(count) || 0));
    const opacityMultiplier = Math.max(0, Math.min(1, Number(opacity) || 0));

    const newHearts = Array.from({ length: clampedCount }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 12 + 6,
      duration: Math.random() * 8 + 4,
      delay: Math.random() * 10,
      opacity: (Math.random() * 0.22 + 0.06) * opacityMultiplier,
    }));
    setHearts(newHearts);
  }, [count, opacity]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1.2, 1, 1, 0],
            opacity: [0, heart.opacity, heart.opacity, 0],
            y: [0, -40, -80]
          }}
          transition={{
            duration: heart.duration,
            repeat: Infinity,
            delay: heart.delay,
            ease: "easeInOut"
          }}
          className="absolute"
          style={{
            left: `${heart.left}%`,
            top: `${heart.top}%`,
            color: 'rgba(176, 56, 120, 0.4)'
          }}
        >
          <Heart size={heart.size} fill="currentColor" />
        </motion.div>
      ))}
    </div>
  );
}
