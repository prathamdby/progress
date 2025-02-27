"use client";

import { useEffect, useState } from "react";
import ReactConfetti from "react-confetti";

interface ConfettiEffectProps {
  duration?: number; // Duration in milliseconds
}

export function ConfettiEffect({ duration = 4000 }: ConfettiEffectProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    // Set initial dimensions
    const getFullHeight = () =>
      Math.max(
        window.innerHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );

    setDimensions({
      width: window.innerWidth,
      height: getFullHeight(),
    });

    // Update dimensions on window resize
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: getFullHeight(),
      });
    };

    window.addEventListener("resize", handleResize);

    // Start cleanup timer
    const timer = setTimeout(() => {
      setIsActive(false);
    }, duration);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, [duration]);

  if (!isActive) return null;

  return (
    <ReactConfetti
      width={dimensions.width}
      height={dimensions.height}
      numberOfPieces={200}
      recycle={false}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 100,
        pointerEvents: "none",
      }}
    />
  );
}
