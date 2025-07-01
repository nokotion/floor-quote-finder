
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface TypewriterProps {
  text: string[];
  speed?: number;
  deleteSpeed?: number;
  waitTime?: number;
  className?: string;
  cursorChar?: string | React.ReactNode;
}

export function Typewriter({
  text,
  speed = 60,
  deleteSpeed = 40,
  waitTime = 1500,
  className = "",
  cursorChar = "|",
}: TypewriterProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const currentWord = text[currentIndex];
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing phase
        if (displayText.length < currentWord.length) {
          setDisplayText(currentWord.slice(0, displayText.length + 1));
        } else {
          // Finished typing, wait then start deleting
          setTimeout(() => setIsDeleting(true), waitTime);
        }
      } else {
        // Deleting phase
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1));
        } else {
          // Finished deleting, move to next word
          setIsDeleting(false);
          setCurrentIndex((prev) => (prev + 1) % text.length);
        }
      }
    }, isDeleting ? deleteSpeed : speed);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentIndex, text, speed, deleteSpeed, waitTime]);

  // Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <span className={cn("inline-block", className)}>
      {displayText}
      <span 
        className={`inline-block w-0.5 bg-current ml-0.5 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}
        style={{ height: '1em' }}
      >
        &nbsp;
      </span>
    </span>
  );
}
