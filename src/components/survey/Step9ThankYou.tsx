import { useEffect, useState } from "react";
import { useSurvey } from "@/context/SurveyContext";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import confetti from "canvas-confetti";
import OpenAI from "openai";

export default function Step9ThankYou() {
  const { userName, mbtiType, topGenres, responseId, gamingHours, platform, laptopPrice, premiumnessAvg, startTime, hobbiesSelected, booksSelected, seriesSelected } = useSurvey();
  const [error, setError] = useState<string | null>(null);
  const [isArbitrary, setIsArbitrary] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const arbitrary = startTime && (Date.now() - startTime) < 30000 ? true : false;
    setIsArbitrary(arbitrary);

    if (!arbitrary && !aiSummary) {
      setIsGenerating(true);
      const generateSummary = async () => {
        try {
          const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
          if (!apiKey) return;
          const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
          const prompt = `The user filled out a gaming survey.
MBTI: ${mbtiType}
Top Gaming Genres: ${topGenres?.join(", ")}
Hobbies: ${hobbiesSelected?.join(", ")}
Books: ${booksSelected?.join(", ")}
Series: ${seriesSelected?.join(", ")}

Write a fun, slightly analytical summary linking their gaming choices to their real-life hobbies and entertainment.
Your heading MUST be either "You prove our Hypothesis!" if their choices align across categories in a predictable way (e.g., strategy games + logic hobbies) OR "You disprove our Hypothesis!" if they are wild and varied.
Explain your reasoning with complete metrics from their choices.
Tone: Post-modern Cyberpunk AI analyzing a subject. Focus sharply on correlation.
Keep it strictly under 200 words. Format with simple paragraphs.`;
          
          const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }]
          });
          setAiSummary(response.choices[0]?.message?.content || null);
        } catch (e) {
          console.error("OpenAI Error:", e);
        } finally {
          setIsGenerating(false);
        }
      };
      generateSummary();
    }

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
      "Below 30,000": 2,
      "30,000 to 60,000": 3,
      "60,000 to 90,000": 4,
      "90,000 to 1,20,000": 5,
      "Above 1,20,000": 6,
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
    <div className="absolute inset-0 glass-panel border border-primary/20 bg-background/50 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.5, type: "spring" }}
        className="w-full max-w-2xl space-y-10"
      >
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-black text-glow-secondary tracking-widest uppercase">
            UPLOAD COMPLETE, {userName}
          </h1>
          <p className="text-xl font-mono text-primary/80 uppercase tracking-widest">
            {">"} DATA SUCCESSFULLY WRITTEN // THANK YOU FOR YOUR CONTRIBUTION {"<"}
          </p>
        </div>

        {isArbitrary ? (
          <div className="glass-panel border-red-500/50 p-6 md:p-10 rounded-xl text-center max-w-2xl w-full mx-auto space-y-4">
            <p className="text-red-400 font-mono text-lg md:text-xl font-bold uppercase tracking-widest">
              Sorry for taking your 30 seconds, but your response is judged to be arbitrary.
            </p>
            <p className="text-white/60 font-mono text-sm tracking-widest">
              Humble request to take a couple of minutes to fill it properly, you might learn a lot about yourself.
            </p>
          </div>
        ) : (
          <div className="glass-panel box-glow p-8 md:p-12 rounded-xl border border-primary/20 shadow-[0_0_40px_rgba(0,241,255,0.15)] max-w-2xl w-full mx-auto space-y-6 text-left">
            <h2 className="text-2xl font-black uppercase text-glow tracking-widest text-center mb-6 border-b border-primary/20 pb-4">
              AI Psycho-Profile Correlation
            </h2>
            
            <div className="space-y-4 font-mono text-white/80">
              {isGenerating ? (
                <p className="animate-pulse text-primary font-bold text-center py-10 uppercase tracking-[0.2em] drop-shadow-[0_0_10px_rgba(0,241,255,1)]">
                  RUNNING NEURAL CORRELATION ANALYSIS...
                </p>
              ) : (
                aiSummary?.split('\n').map((line, i) => (
                  <p key={i} className="mb-2 leading-relaxed tracking-wide text-sm md:text-base">
                    {line}
                  </p>
                ))
              )}
            </div>
          </div>
        )}

        {error && <p className="text-red-400 font-mono text-sm uppercase text-center mt-4">ERR: {error}</p>}
        
        <p className="text-white/40 font-mono tracking-widest uppercase text-xs md:text-sm max-w-md mx-auto pt-8">
          TRANSMISSION SECURE. IT IS SAFE TO CLOSE THIS TERMINAL.
        </p>
      </motion.div>
    </div>
  );
}
