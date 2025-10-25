"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Eye } from "lucide-react";

export function EyeComfortToggle() {
  const [isEyeComfortMode, setIsEyeComfortMode] = useState(false);

  useEffect(() => {
    // Check for saved eye comfort mode preference
    const savedPreference = localStorage.getItem("eye-comfort-mode");
    if (savedPreference === "true") {
      setIsEyeComfortMode(true);
      document.documentElement.classList.add("eye-comfort");
    }
  }, []);

  const toggleEyeComfortMode = () => {
    const newMode = !isEyeComfortMode;
    setIsEyeComfortMode(newMode);
    localStorage.setItem("eye-comfort-mode", String(newMode));

    if (newMode) {
      document.documentElement.classList.add("eye-comfort");
    } else {
      document.documentElement.classList.remove("eye-comfort");
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleEyeComfortMode}
      aria-label="Toggle eye comfort mode"
      className="relative"
    >
      <Eye className="h-4 w-4" />
      {isEyeComfortMode && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full"></span>
      )}
    </Button>
  );
}
