"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import AdminDashboard from "@/components/admin/AdminDashboard";

const CORRECT_PIN = "9999";

export default function AdminPage() {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Check if fully typed
    const currentPin = pin.join("");
    if (currentPin.length === 4) {
      if (currentPin === CORRECT_PIN) {
        setIsAuthenticated(true);
      } else {
        setError(true);
        setTimeout(() => {
          setPin(["", "", "", ""]);
          setError(false);
          inputsRef.current[0]?.focus();
        }, 1000);
      }
    }
  }, [pin]);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Auto focus next
    if (value && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  if (isAuthenticated) {
    return <AdminDashboard />;
  }

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-4 z-50 text-white">
      <div className="text-center space-y-8 max-w-sm w-full">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          Admin Access
        </h1>
        
        <motion.div 
          animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex justify-center gap-4"
        >
          {pin.map((digit, idx) => (
            <input
              key={idx}
              ref={el => { inputsRef.current[idx] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className={`w-16 h-20 text-center text-3xl font-bold rounded-xl border-2 shadow-lg transition-colors bg-white/5 focus:outline-none ${
                error ? "border-red-500 text-red-500" : "border-white/20 focus:border-primary"
              }`}
            />
          ))}
        </motion.div>

        <div className="h-6">
          {error && <p className="text-red-500 font-bold">Wrong PIN</p>}
        </div>
      </div>
    </div>
  );
}
