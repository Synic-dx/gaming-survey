import { useState, FormEvent, useEffect } from "react";
import { useSurvey } from "@/context/SurveyContext";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

const titleText = "Let's figure out what your gaming says about you.";

export default function Step0Welcome() {
  const { setStep, setResponseId, setUserName } = useSurvey();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      // Create new row
      const { data, error: dbError } = await supabase
        .from('responses')
        .insert([{ name: name.trim() }])
        .select()
        .single();
        
      if (dbError) throw dbError;
      
      if (data) {
        setResponseId(data.id);
        setUserName(data.name);
        setStep(1); // Go to About You
      } else {
         // Fallback if no data is returned but no error thrown
        setUserName(name.trim());
        setStep(1);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
      // Soft fallback for testing offline/without DB configured properly
      setUserName(name.trim());
      setStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#1e1b4b] to-[#2e1065] flex flex-col items-center justify-center p-6 text-center z-50">
      <div className="w-full max-w-2xl space-y-12">
        <h1 className="text-4xl md:text-6xl font-bold font-sans tracking-tight min-h-[140px] md:min-h-[160px] flex items-center justify-center">
          {/* Typewriter effect */}
          {titleText.split("").map((char, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </h1>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: titleText.length * 0.05 + 0.2 }}
          onSubmit={handleSubmit}
          className="flex flex-col items-center space-y-6"
        >
          <div className="relative w-full max-w-md">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What should we call you?"
              disabled={isLoading}
              className="w-full text-center text-xl md:text-2xl bg-white/5 border border-white/20 rounded-full py-4 px-6 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            {/* Glowing border animation */}
            <motion.div
              className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-full -z-10 opacity-0 blur"
              animate={{ opacity: name.trim() ? 0.3 : 0 }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <motion.button
            type="submit"
            disabled={!name.trim() || isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: name.trim() ? "0px 0px 20px rgba(59, 130, 246, 0.4)" : "none",
            }}
            className={`px-10 py-4 rounded-full font-bold text-lg md:text-xl transition-colors ${
              name.trim() ? "bg-primary text-white hover:bg-primary/90" : "bg-white/10 text-white/50 cursor-not-allowed"
            }`}
          >
            {isLoading ? "Loading..." : "Let's Go"}
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
}
