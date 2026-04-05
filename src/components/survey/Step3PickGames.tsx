"use client";

import { useState } from "react";
import { useSurvey } from "@/context/SurveyContext";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { GAME_DATA } from "@/constants/gameData";
import OpenAI from "openai";
import { Check } from "lucide-react";

const premiumnessColors: Record<number, string> = {
  1: "#22c55e",
  2: "#3b82f6",
  3: "#eab308",
  4: "#f97316",
  5: "#ef4444",
};

export default function Step3PickGames() {
  const { setStep, responseId, setTopGenres, setPremiumnessAvg } = useSurvey();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [topGenresRevealed, setTopGenresRevealed] = useState<string[]>([]);
  
  const toggleGame = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((gid) => gid !== id) : [...prev, id]
    );
  };

  const handleNext = async () => {
    if (selectedIds.length < 3) return;

    setIsLoading(true);
    
    const selectedGames = GAME_DATA.filter((g) => selectedIds.includes(g.id));
    const genreScores: Record<string, number> = {};
    const traitScores: Record<string, number> = {};
    let totalPremiumness = 0;

    selectedGames.forEach((g) => {
      g.genres.forEach((genre) => {
        genreScores[genre] = (genreScores[genre] || 0) + 1;
      });
      g.traits.forEach((trait) => {
        traitScores[trait] = (traitScores[trait] || 0) + 1;
      });
      totalPremiumness += g.premiumness;
    });

    const totalSelected = selectedGames.length;
    let fallbackTopGenres: string[] = [];
    
    // Normalize and prepare fallback just in case OpenAI fails
    Object.keys(genreScores).forEach((k) => (genreScores[k] /= totalSelected));
    Object.keys(traitScores).forEach((k) => (traitScores[k] /= totalSelected));
    const premiumnessAvg = totalPremiumness / totalSelected;
    
    const sortedGenres = Object.entries(genreScores)
      .sort((a, b) => b[1] - a[1])
      .map((entry) => entry[0])
      .slice(0, 5);
    fallbackTopGenres = sortedGenres;

    let aiGenres = fallbackTopGenres;

    try {
      // Initialize OpenAI conditionally here
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      
      if (apiKey) {
        const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
        const prompt = `Given these normalized genre scores for a gamer: ${JSON.stringify(genreScores)}
And these trait scores: ${JSON.stringify(traitScores)}
Return ONLY a JSON array of exactly 5 strings representing their top gaming personality traits or genre preferences, written in a fun and casual way. For example: ["Competitive Shooter Addict", "Open World Explorer", "Casual Mobile Chiller", "Story-Driven Adventurer", "Strategy Mastermind"]. Make them feel personalized and specific to this player's profile. Return ONLY the JSON array, no other text.`;
        
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 200,
        });
        
        const rawResponse = response.choices[0]?.message?.content || "";
        try {
          const parsed = JSON.parse(rawResponse.replace(/```json/g, '').replace(/```/g, '').trim());
          if (Array.isArray(parsed) && parsed.length > 0) {
            aiGenres = parsed;
          }
        } catch(e) {
          console.warn("Could not parse OpenAI response", rawResponse, e);
        }
      }
    } catch (err) {
      console.error("OpenAI error, using fallback", err);
    }

    try {
      if (responseId) {
        await supabase
          .from("responses")
          .update({
            games_selected: selectedIds,
            genre_scores: genreScores,
            trait_scores: traitScores,
            premiumness_avg: premiumnessAvg,
            top_genres: aiGenres,
          })
          .eq("id", responseId);
      }

      setTopGenres(aiGenres);
      setPremiumnessAvg(premiumnessAvg);
      setTopGenresRevealed(aiGenres);
      setShowReveal(true);
    } catch (err) {
      console.error(err);
      // Fallback
      setTopGenres(aiGenres);
      setPremiumnessAvg(premiumnessAvg);
      setTopGenresRevealed(aiGenres);
      setShowReveal(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (showReveal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-12 text-center py-10">
        <h2 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary">
          Your Gaming DNA
        </h2>
        
        <div className="flex flex-wrap justify-center gap-4 max-w-3xl">
          {topGenresRevealed.map((genre, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: idx * 0.4, type: "spring", stiffness: 100 }}
              className="px-6 py-4 rounded-xl text-lg font-bold bg-white/10 border border-white/20 shadow-lg"
              style={{
                boxShadow: `0 4px 20px ${Object.values(premiumnessColors)[idx % 5]}40`,
                borderColor: `${Object.values(premiumnessColors)[idx % 5]}80`
              }}
            >
              {genre}
            </motion.div>
          ))}
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: topGenresRevealed.length * 0.4 + 0.5 }}
          onClick={() => setStep(4)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-10 py-4 bg-primary text-white text-xl font-bold rounded-full shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:bg-primary/90"
        >
          Continue
        </motion.button>
      </div>
    );
  }

  return (
    <div className="w-full pb-32 space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-5xl font-bold">Pick your games</h2>
        <p className="text-white/60 text-lg">Select all the games you play or have enjoyed in the past year.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {GAME_DATA.map((game) => {
          const isSelected = selectedIds.includes(game.id);
          const color = premiumnessColors[game.premiumness];
          
          return (
            <motion.div
              key={game.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleGame(game.id)}
              className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-200 select-none ${
                isSelected ? "bg-white/10" : "bg-white/5 hover:bg-white/10"
              }`}
              style={{
                borderLeft: `4px solid ${color}`,
                boxShadow: isSelected ? `0 0 15px ${color}60` : "none",
              }}
            >
              <div className={`p-4 h-full border border-transparent ${isSelected ? 'border-r-white/20 border-t-white/20 border-b-white/20' : ''} rounded-r-xl`}>
                <h3 className="font-bold text-sm md:text-base pr-4 leading-tight">{game.name}</h3>
                <p className="text-xs text-white/50 mt-1">{game.platform}</p>
              </div>

              {/* Checkmark overlay */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="absolute top-2 right-2 bg-primary rounded-full p-1 shadow-md"
                  >
                    <Check size={14} className="text-white" strokeWidth={3} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 w-full bg-background/80 backdrop-blur-md border-t border-white/10 p-4 md:p-6 flex items-center justify-between z-10">
        <div className="text-lg font-medium pl-2 md:pl-8">
          <span className={selectedIds.length >= 3 ? "text-primary" : "text-white/60"}>
            {selectedIds.length}
          </span>
          <span className="text-white/60"> / 50 selected</span>
        </div>
        
        <div className="pr-2 md:pr-8">
          <motion.button
            onClick={handleNext}
            disabled={selectedIds.length < 3 || isLoading}
            whileHover={{ scale: selectedIds.length >= 3 ? 1.05 : 1 }}
            whileTap={{ scale: selectedIds.length >= 3 ? 0.95 : 1 }}
            className={`px-8 py-3 rounded-full font-bold text-lg md:text-xl transition-colors ${
              selectedIds.length >= 3
                ? "bg-primary text-white hover:bg-primary/90 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                : "bg-white/10 text-white/40 cursor-not-allowed"
            }`}
          >
            {isLoading ? "Saving..." : selectedIds.length < 3 ? "Pick 3+" : "Next"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
