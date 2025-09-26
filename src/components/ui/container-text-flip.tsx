"use client";

import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
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
  /** Minimum width in pixels to prevent layout shift */
  minWidth?: number;
}

export function ContainerTextFlip({
  words = ["better", "modern", "beautiful", "awesome"],
  interval = 3000,
  className,
  textClassName,
  animationDuration = 700,
  minWidth,
}: ContainerTextFlipProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState<number>(minWidth || 120);
  const measureRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Measure the width of the longest word
  useLayoutEffect(() => {
    if (measureRef.current) {
      let maxWidth = minWidth || 0;
      
      // Create a temporary element to measure each word
      const tempElement = document.createElement('span');
      tempElement.style.visibility = 'hidden';
      tempElement.style.position = 'absolute';
      tempElement.style.whiteSpace = 'nowrap';
      tempElement.className = textClassName || '';
      document.body.appendChild(tempElement);
      
      words.forEach(word => {
        tempElement.textContent = word;
        const rect = tempElement.getBoundingClientRect();
        maxWidth = Math.max(maxWidth, Math.ceil(rect.width + 4)); // Add 4px padding
      });
      
      document.body.removeChild(tempElement);
      setContainerWidth(maxWidth);
      setIsLoaded(true);
    }
  }, [words, textClassName, minWidth]);

  useEffect(() => {
    if (!isLoaded) return;
    
    const intervalId = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, interval);

    return () => clearInterval(intervalId);
  }, [words, interval, isLoaded]);

  return (
    <span 
      className={cn("relative inline-block", className)}
      style={{ 
        width: `${containerWidth}px`,
        minHeight: '1.8em' // Increased height to prevent clipping of descenders
      }}
    >
      {/* Measuring reference - hidden but maintains font properties */}
      <div
        ref={measureRef}
        className="sr-only"
        aria-hidden="true"
      />
      
      {/* Animated text container */}
      <AnimatePresence mode="wait">
        <motion.span
          key={words[currentWordIndex]}
          initial={{ 
            opacity: 0,
            y: 8,
            filter: "blur(8px)"
          }}
          animate={{ 
            opacity: 1,
            y: 0,
            filter: "blur(0px)"
          }}
          exit={{ 
            opacity: 0,
            y: -8,
            filter: "blur(8px)"
          }}
          transition={{
            duration: animationDuration / 1000,
            ease: "easeInOut",
          }}
          className={cn(
            "absolute inset-0 flex items-center justify-center whitespace-nowrap",
            textClassName
          )}
        >
          {words[currentWordIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}