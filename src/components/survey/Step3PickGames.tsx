import { useState } from "react";
import { useSurvey } from "@/context/SurveyContext";
import { motion, AnimatePresence } from "framer-motion";
import { GAME_DATA } from "@/constants/gameData";
import OpenAI from "openai";
import { Check } from "lucide-react";

// Unused multi-color dynamic system removed in favor of strict dark cyan theme

export default function Step3PickGames() {
  const { 
    setStep, setTopGenres, setPremiumnessAvg, 
    setGamesSelected, setGenreScores, setTraitScores 
  } = useSurvey();
  
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
    if (selectedIds.length < 1) return;

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

    setGamesSelected(selectedIds);
    setGenreScores(genreScores);
    setTraitScores(traitScores);
    setPremiumnessAvg(premiumnessAvg);
    setTopGenres(aiGenres);
    
    setTopGenresRevealed(aiGenres);
    setShowReveal(true);
    setIsLoading(false);
  };

  if (showReveal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-12 text-center py-10 relative z-10">
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-widest text-glow-secondary font-sans">
          Your Gaming DNA
        </h2>
        
        <div className="flex flex-wrap justify-center gap-4 max-w-3xl">
          {topGenresRevealed.map((genre, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.5, y: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: idx * 0.4, type: "spring", stiffness: 100 }}
              className="px-6 py-4 rounded-xl text-lg md:text-xl font-bold glass-panel border border-primary/50 text-white shadow-[0_0_15px_rgba(0,241,255,0.4)]"
            >
              <span className="text-glow">{genre}</span>
            </motion.div>
          ))}
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: topGenresRevealed.length * 0.4 + 0.5 }}
          onClick={() => setStep(4)}
          whileHover={{ scale: 1.05, filter: "brightness(1.5)" }}
          whileTap={{ scale: 0.95 }}
          className="px-12 py-5 bg-transparent border-2 border-primary text-white text-xl font-black tracking-widest uppercase rounded-lg shadow-[0_0_30px_rgba(0,241,255,0.4)] hover:bg-primary/20"
        >
          Initialize Next Phase
        </motion.button>
      </div>
    );
  }

  return (
    <div className="w-full pb-24 md:pb-32 space-y-8 md:space-y-10 relative">
      <div className="text-center space-y-2 md:space-y-3">
        <h2 className="text-2xl md:text-5xl font-black uppercase text-glow tracking-widest">Select Software</h2>
        <p className="text-primary/80 font-mono text-sm md:text-lg uppercase tracking-widest">Awaiting database connection [MIN: 1]</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        {[...GAME_DATA].sort((a, b) => b.premiumness - a.premiumness).map((game, idx) => {
          const isSelected = selectedIds.includes(game.id);
          const colorVar = "var(--color-primary)";
          
          return (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              whileHover={{ scale: 1.05, filter: "brightness(1.2)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleGame(game.id)}
              className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-200 select-none glass-panel border ${
                isSelected ? "bg-white/10 border-primary" : "border-white/10 hover:border-primary/50"
              }`}
              style={{
                boxShadow: isSelected ? `0 0 25px ${colorVar}, inset 0 0 10px ${colorVar}` : "none",
                borderColor: isSelected ? colorVar : undefined
              }}
            >
              {/* Scanline overlay for glitch variant FX */ }
              <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjIiIGZpbGw9InJnYmEoMCwyNDEsMjU1LDAuMDUpIi8+PC9zdmc+')] mix-blend-overlay opacity-30" />
              
              <div className="p-3 md:p-4 h-full relative z-10 flex flex-col justify-end min-h-[80px] md:min-h-[100px]">
                <h3 className="font-bold text-xs md:text-base leading-tight drop-shadow-md text-white">{game.name}</h3>
                <p className="text-[9px] md:text-[10px] uppercase tracking-wider text-white/50 mt-1 font-mono">{game.platform}</p>
              </div>

              {/* Holographic glowing Checkmark */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
                    className="absolute top-2 right-2 bg-black/60 rounded-full p-1 border border-primary shadow-[0_0_10px_var(--color-primary)] z-20"
                    style={{ borderColor: colorVar, boxShadow: `0 0 10px ${colorVar}` }}
                  >
                    <Check size={14} color={colorVar} strokeWidth={4} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Cyberpunk Dock footer */}
      <div className="fixed bottom-0 left-0 w-full glass-panel border-t border-primary/20 p-3 md:p-6 flex items-center justify-between z-50">
        <div className="text-xs md:text-lg font-black font-mono pl-2 md:pl-8 flex items-center space-x-2">
          <span className="animate-pulse w-2 h-2 md:w-3 md:h-3 bg-secondary rounded-full inline-block shadow-[0_0_10px_var(--color-secondary)]"></span>
          <span className={selectedIds.length >= 1 ? "text-primary text-glow" : "text-white/40"}>
            [ DATA: {selectedIds.length} / 50 ]
          </span>
        </div>
        
        <div className="pr-2 md:pr-8">
          <motion.button
            onClick={handleNext}
            disabled={selectedIds.length < 1 || isLoading}
            whileHover={{ scale: selectedIds.length >= 1 ? 1.05 : 1 }}
            whileTap={{ scale: selectedIds.length >= 1 ? 0.95 : 1 }}
            className={`px-4 md:px-8 py-2 md:py-3 rounded-lg font-black text-xs md:text-xl uppercase tracking-[0.05em] md:tracking-[0.1em] transition-all border-2 ${
              selectedIds.length >= 1
                ? "bg-primary/10 border-primary text-primary hover:bg-primary/30 shadow-[0_0_20px_rgba(0,241,255,0.4)] text-glow"
                : "bg-white/5 border-white/10 text-white/30 cursor-not-allowed"
            }`}
          >
            {isLoading ? "UPLOADING..." : selectedIds.length < 1 ? "WAITING INPUT" : "CONFIRM"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
