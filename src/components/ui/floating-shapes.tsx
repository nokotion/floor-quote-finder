import React from "react";
import { motion } from "framer-motion";

export const FloatingShapes = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-5">
      {/* Floating circles */}
      <motion.div
        className="absolute top-20 right-[15%] w-3 h-3 rounded-full bg-gradient-to-br from-orange-400/30 to-rose-400/30"
        animate={{
          y: [0, -15, 0],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-40 left-[10%] w-2 h-2 rounded-full bg-gradient-to-br from-amber-400/40 to-orange-400/40"
        animate={{
          y: [0, 10, 0],
          x: [0, 5, 0],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      <motion.div
        className="absolute bottom-32 right-[20%] w-4 h-4 rounded-full bg-gradient-to-br from-rose-400/25 to-pink-400/25"
        animate={{
          y: [0, -10, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      
      {/* Floating squares/diamonds */}
      <motion.div
        className="absolute top-32 right-[30%] w-2 h-2 rotate-45 bg-gradient-to-br from-orange-300/30 to-amber-300/30"
        animate={{
          rotate: [45, 90, 45],
          y: [0, -8, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-40 left-[25%] w-3 h-3 rotate-45 bg-gradient-to-br from-rose-300/25 to-orange-300/25"
        animate={{
          rotate: [45, 0, 45],
          y: [0, 12, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5,
        }}
      />

      {/* Dot grid pattern */}
      <div className="absolute top-10 left-[5%] grid grid-cols-3 gap-2 opacity-20">
        {[...Array(9)].map((_, i) => (
          <motion.div
            key={i}
            className="w-1 h-1 rounded-full bg-primary/40"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
};
