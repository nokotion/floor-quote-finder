"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ContainerTextFlipProps {
  /** Array of words to cycle through in the animation */
  words?: string[];
  /** Time in milliseconds between word transitions */
  interval?: number;
  /** Additional CSS classes to apply to the container */
  className?: string;
  /** Additional CSS classes to apply to the text */
  textClassName?: string;
  /** Duration of the transition animation in milliseconds */
  animationDuration?: number;
}

export function ContainerTextFlip({
  words = ["better", "modern", "beautiful", "awesome"],
  interval = 3000,
  className,
  textClassName,
  animationDuration = 700,
}: ContainerTextFlipProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState<number | undefined>(undefined);
  const measureRef = useRef<HTMLSpanElement>(null);

  // Measure the width of the longest word on mount
  useEffect(() => {
    if (measureRef.current) {
      let maxWidth = 0;
      words.forEach(word => {
        if (measureRef.current) {
          measureRef.current.textContent = word;
          const width = measureRef.current.getBoundingClientRect().width;
          maxWidth = Math.max(maxWidth, width);
        }
      });
      setContainerWidth(Math.ceil(maxWidth));
    }
  }, [words, textClassName]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, interval);

    return () => clearInterval(intervalId);
  }, [words, interval]);

  return (
    <span 
      className={cn("relative inline-block", className)}
      style={{ width: containerWidth ? `${containerWidth}px` : 'auto' }}
    >
      {/* Invisible measuring element */}
      <span
        ref={measureRef}
        className={cn("absolute opacity-0 pointer-events-none whitespace-nowrap", textClassName)}
        aria-hidden="true"
      />
      
      {/* Animated text container */}
      <span className="relative block w-full">
        <AnimatePresence mode="wait">
          <motion.span
            key={words[currentWordIndex]}
            initial={{ 
              opacity: 0,
              y: 20,
              filter: "blur(8px)"
            }}
            animate={{ 
              opacity: 1,
              y: 0,
              filter: "blur(0px)"
            }}
            exit={{ 
              opacity: 0,
              y: -20,
              filter: "blur(8px)"
            }}
            transition={{
              duration: animationDuration / 1000,
              ease: "easeInOut",
            }}
            className={cn("absolute inset-0 flex items-center whitespace-nowrap", textClassName)}
          >
            {words[currentWordIndex]}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}