import { useEffect, useState } from "react";
import { useSurvey } from "@/context/SurveyContext";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import confetti from "canvas-confetti";

export default function Step9ThankYou() {
  const { userName, mbtiType, topGenres, responseId, gamingHours, platform, laptopPrice, premiumnessAvg } = useSurvey();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Trigger confetti
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    // Calculate score
    const scoreMap: Record<string, number> = {
      "I do not own one": 1,
      "Below 50,000": 2,
      "50,000 to 1,00,000": 3,
      "1,00,000 to 1,50,000": 4,
      "Above 1,50,000": 5,
    };
    const laptopScore = scoreMap[laptopPrice] || 1;
    
    const isNonGamer = gamingHours === "Less than 3" || platform === "I do not play games";
    
    let socioeconomic_score = laptopScore;
    if (!isNonGamer) {
      socioeconomic_score = (laptopScore * 0.8) + (premiumnessAvg * 0.2);
    }

    // Save final state
    if (responseId) {
      supabase
        .from("responses")
        .update({
          socioeconomic_score,
          completed: true,
        })
        .eq("id", responseId)
        .then(({ error: dbError }) => {
          if (dbError) setError(dbError.message);
        });
    }

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 bg-background flex flex-col items-center justify-center p-6 text-center z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="w-full max-w-2xl space-y-10"
      >
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            You&apos;re all done, {userName}!
          </h1>
          <p className="text-xl text-white/80">
            Thanks for being part of this research. Your data helps us understand the connection between gaming, personality, and real life.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 max-w-2xl w-full shadow-2xl space-y-8">
          <h2 className="text-2xl font-bold border-b border-white/10 pb-4">Your Profile Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <h3 className="text-white/50 uppercase tracking-wider text-sm font-bold">MBTI Type</h3>
              <div className="text-5xl font-black text-secondary">{mbtiType || "Unknown"}</div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-white/50 uppercase tracking-wider text-sm font-bold">Top Gaming Traits</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {topGenres && topGenres.length > 0 ? topGenres.map((g, idx) => (
                  <span key={idx} className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                    {g}
                  </span>
                )) : (
                  <span className="text-white/40">Not available</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        
        <p className="text-white/40 text-sm max-w-md mx-auto pt-8">
          You can close this tab now. Your response has been securely saved.
        </p>
      </motion.div>
    </div>
  );
}
