"use client";

import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [isMobile, setIsMobile] = useState(true);
  const glowX = useSpring(-400, { stiffness: 100, damping: 30, mass: 1 });
  const glowY = useSpring(-400, { stiffness: 100, damping: 30, mass: 1 });

  useEffect(() => {
    setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    const updateMousePosition = (e: MouseEvent) => {
      glowX.set(e.clientX);
      glowY.set(e.clientY);
    };

    window.addEventListener("mousemove", updateMousePosition);
    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, [glowX, glowY]);

  if (isMobile) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 w-[800px] h-[800px] pointer-events-none z-[0]"
      style={{
        x: glowX,
        y: glowY,
        translateX: "-50%",
        translateY: "-50%",
        background: "radial-gradient(circle, rgba(0, 241, 255, 0.05) 0%, rgba(0, 0, 0, 0) 60%)"
      }}
    />
  );
}
