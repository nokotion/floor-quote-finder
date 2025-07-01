
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TextRotateProps {
  texts: string[];
  mainClassName?: string;
  staggerFrom?: "first" | "last" | "center";
  initial?: any;
  animate?: any;
  exit?: any;
  staggerDuration?: number;
  transition?: any;
  rotationInterval?: number;
}

export function TextRotate({
  texts,
  mainClassName = "",
  staggerFrom = "last",
  initial = { y: "100%" },
  animate = { y: 0 },
  exit = { y: "-120%" },
  staggerDuration = 0.03,
  transition = { type: "spring", damping: 20, stiffness: 300 },
  rotationInterval = 2000,
}: TextRotateProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, rotationInterval);
    return () => clearInterval(timer);
  }, [texts.length, rotationInterval]);

  const currentText = texts[index];

  const getStaggerDelay = (charIndex: number, totalChars: number) => {
    switch (staggerFrom) {
      case "first":
        return charIndex * staggerDuration;
      case "last":
        return (totalChars - 1 - charIndex) * staggerDuration;
      case "center":
        const center = Math.floor(totalChars / 2);
        return Math.abs(charIndex - center) * staggerDuration;
      default:
        return 0;
    }
  };

  return (
    <LayoutGroup>
      <div className={cn("inline-block relative", mainClassName)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentText}
            className="inline-flex"
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {currentText.split("").map((char, charIndex) => (
              <motion.span
                key={`${currentText}-${charIndex}`}
                className="inline-block"
                variants={{
                  hidden: {
                    ...initial,
                    transition: {
                      ...transition,
                      delay: getStaggerDelay(charIndex, currentText.length),
                    },
                  },
                  visible: {
                    ...animate,
                    transition: {
                      ...transition,
                      delay: getStaggerDelay(charIndex, currentText.length),
                    },
                  },
                  exit: {
                    ...exit,
                    transition: {
                      ...transition,
                      delay: getStaggerDelay(charIndex, currentText.length),
                    },
                  },
                }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}
