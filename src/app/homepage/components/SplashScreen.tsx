"use client";

import React, { useEffect, useState } from "react";
import AppImage from "@/components/ui/AppImage";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 2000);
    const doneTimer = setTimeout(() => onComplete(), 2600);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-600"
      style={{
        backgroundColor: "#C41E3A",
        opacity: fading ? 0 : 1,
        transition: "opacity 0.6s ease-out",
        pointerEvents: fading ? "none" : "all",
      }}
    >
      <div className="flex flex-col items-center gap-6 px-8">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-white flex items-center justify-center shadow-2xl">
          <AppImage
            src="/assets/images/ssvm_final_logo-1774922153874.png"
            alt="Sri Saraswathi Vidhya Mandir School Logo"
            width={128}
            height={128}
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-white text-2xl font-bold text-center leading-tight tracking-wide">
          Sri Saraswathi Vidhya Mandir
        </h1>
        <p
          className="text-center text-base font-medium tracking-widest"
          style={{ color: "#FFD700" }}
        >
          Research • Self Confidence • Humility
        </p>
      </div>
    </div>
  );
}
