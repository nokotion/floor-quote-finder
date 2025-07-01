
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const adjectives = [
  "Affordable",
  "Trusted", 
  "Local",
  "Competitive",
  "Quality",
];

export function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % adjectives.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-muted py-16 md:py-32">
      <div className="container text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          Get{" "}
          <span className="relative inline-block h-[1em] w-[12ch] overflow-hidden align-baseline">
            {adjectives.map((word, i) => (
              <motion.span
                key={word}
                className="absolute w-full font-bold text-blue-600"
                initial={{ y: "-100%", opacity: 0 }}
                animate={
                  i === index
                    ? { y: "0%", opacity: 1 }
                    : { y: "-100%", opacity: 0 }
                }
                transition={{ duration: 0.5 }}
              >
                {word}
              </motion.span>
            ))}
          </span>{" "}
          Flooring Quotes from <br />
          <span className="font-bold">Verified Local Retailers</span>
        </h1>
      </div>
    </div>
  );
}
