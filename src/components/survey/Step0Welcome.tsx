import { useState, FormEvent } from "react";
import { useSurvey } from "@/context/SurveyContext";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Step0Welcome() {
  const { setStep, setUserName } = useSurvey();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    setIsLoading(true);
    // Name is saved purely locally along with other details. DB insertion is deferred to Step 5.
    setTimeout(() => {
      setUserName(name.trim());
      setStep(1);
      setIsLoading(false);
    }, 400); // Small psychological loading delay
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-50 overflow-hidden bg-black">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[150px] animate-float" />
      
      {/* Admin Button */}
      <div className="absolute top-4 right-4 md:top-8 md:right-8 z-[60]">
        <Link href="/admin">
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="px-3 py-1.5 md:px-4 md:py-2 bg-white/5 border border-white/10 rounded-full text-[10px] md:text-sm font-mono text-white/50 hover:text-primary hover:border-primary/50 hover:bg-primary/10 transition-all font-bold tracking-widest uppercase cursor-pointer backdrop-blur-md shadow-[0_0_10px_rgba(0,0,0,0.5)]"
          >
            Admin (Group 6)
          </motion.div>
        </Link>
      </div>
      
      <div className="w-full relative z-10 px-4 md:px-12 flex flex-col items-center justify-center space-y-8 md:space-y-12">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight text-center text-white max-w-[95vw] md:max-w-[80vw] drop-shadow-[0_0_25px_rgba(0,241,255,0.5)]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            How your personality drives your gaming, reading, and binging.
          </motion.div>
        </h1>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          onSubmit={handleSubmit}
          className="flex flex-col items-center space-y-8 w-full max-w-md pt-8"
        >
          <div className="w-full relative group">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What's your name?"
              disabled={isLoading}
              className="w-full bg-transparent border-b-2 border-white/20 py-3 md:py-4 px-2 text-xl md:text-3xl text-center text-white placeholder-white/30 focus:outline-none focus:border-primary transition-all font-light"
            />
            <p className="mt-3 text-white/30 text-xs md:text-sm text-center tracking-wide">
              Doesn&apos;t have to be your real name - just for indexing. This survey is fully anonymous.
            </p>
          </div>

          {error && <p className="text-red-400 text-sm tracking-wide">{error}</p>}

          <motion.button
            type="submit"
            disabled={!name.trim() || isLoading}
            whileHover={name.trim() ? { scale: 1.02 } : {}}
            whileTap={name.trim() ? { scale: 0.98 } : {}}
            className={`w-full py-3 md:py-4 rounded-full font-medium text-base md:text-lg tracking-wide transition-all ${
              name.trim() ? "bg-primary text-black hover:bg-[#00d4ff] shadow-[0_4px_14px_0_rgba(0,241,255,0.39)] hover:shadow-[0_6px_20px_rgba(0,241,255,0.23)]" : "bg-white/5 text-white/30 cursor-not-allowed"
            }`}
          >
            {isLoading ? "Loading..." : "Get Started"}
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
}
