"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function BootOverlay() {
  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => {
    // Match the timeout duration with the animation duration
    const animationDuration = 2000; // 2 seconds
    const timer = setTimeout(() => setShowOverlay(false), animationDuration);
    return () => clearTimeout(timer);
  }, []);

  if (!showOverlay) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black text-green-400 text-xl font-mono"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 2 }}
    >
      <div className="text-center">
        <p>BOOTING ROOTWEAR SYSTEM...</p>
      </div>
    </motion.div>
  );
}
