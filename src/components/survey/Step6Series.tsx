import { useState, useEffect } from "react";
import { useSurvey } from "@/context/SurveyContext";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Check } from "lucide-react";

const options = [
  "Action / Superhero (The Boys, Daredevil, Invincible, The Punisher)",
  "Thriller / Suspense (Breaking Bad, Better Call Saul, Dark, Narcos, Barry)",
  "Crime / Mafia (Peaky Blinders, Ozark, Narcos, Mirzapur, Gangs of Wasseypur)",
  "Political / Power Drama (Succession, House of Cards, Yes Minister, Scam 1992)",
  "Comedy / Sitcom (The Office, Brooklyn Nine Nine, Friends, Seinfeld, Panchayat)",
  "Horror (Stranger Things, Haunting of Hill House, Wednesday)",
  "Sci-Fi (Black Mirror, Westworld, Love Death and Robots, The Expanse)",
  "Fantasy (Game of Thrones, The Witcher, House of the Dragon, Shadow and Bone)",
  "Anime (Attack on Titan, Death Note, Naruto, One Piece, Demon Slayer, Jujutsu Kaisen)",
  "K-Drama / Asian (Squid Game, Crash Landing on You, Parasite)",
  "Spy / Espionage / Military (The Family Man, Special Ops, Band of Brothers, Homeland)",
  "Slice of Life / Feel Good (Panchayat, Ted Lasso, Kota Factory, Studio Ghibli)",
  "Documentary / True Crime (Making a Murderer, Our Planet, Wild Wild Country)",
  "Drama / Prestige TV (Succession, The Sopranos, Mad Men, Chernobyl, The Crown)",
];

export default function Step6Series() {
  const { setStep, responseId } = useSurvey();
  const [selected, setSelected] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleSelection = (opt: string) => {
    if (selected.includes(opt)) {
      setSelected(selected.filter((s) => s !== opt));
    } else {
      if (selected.length < 5) setSelected([...selected, opt]);
    }
  };

  useEffect(() => {
    if (selected.length === 5) {
      const t = setTimeout(() => {
        handleNext();
      }, 600);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected.length]);

  const handleNext = async () => {
    if (selected.length === 0) return;
    setIsLoading(true);
    try {
      if (responseId) {
        await supabase
          .from("responses")
          .update({ series_selected: selected })
          .eq("id", responseId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      setStep(7);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-3xl mx-auto space-y-10 w-full py-10 pb-32">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-5xl font-bold">What do you binge?</h2>
        <p className="text-white/60 text-lg">Pick your top 1 to 5 favorite genres.</p>
      </div>

      <div className="flex flex-col gap-3 w-full">
        {options.map((opt, idx) => {
          const isSelected = selected.includes(opt);
          const isDisabled = !isSelected && selected.length >= 5;
          return (
            <motion.button
              key={opt}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => toggleSelection(opt)}
              whileTap={{ scale: isDisabled ? 1 : 0.98 }}
              className={`relative flex items-center justify-between w-full p-4 rounded-2xl text-left transition-all ${
                isSelected
                  ? "bg-primary/20 border-2 border-primary"
                  : "bg-white/5 border-2 border-transparent hover:bg-white/10"
              } ${isDisabled ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              <span className="font-medium pr-8">{opt}</span>
              {isSelected && (
                <div className="absolute right-4 rounded-full bg-primary p-1 text-white shadow-md">
                  <Check size={16} strokeWidth={3} />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-background/90 backdrop-blur-md border-t border-white/10 p-4 md:p-6 flex items-center justify-between z-10">
         <div className="text-sm md:text-base font-medium pl-2 md:pl-8">
          <span className={selected.length >= 1 ? "text-primary" : "text-white/60"}>
            {selected.length}
          </span>
          <span className="text-white/60"> / 5 selected (Min 1, Up to 5)</span>
        </div>
        <div className="pr-2 md:pr-8">
          <motion.button
            onClick={handleNext}
            disabled={selected.length === 0 || isLoading}
            className={`px-8 py-3 rounded-full font-bold text-xl transition-colors ${
              selected.length > 0
                ? "bg-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:bg-primary/90"
                : "bg-white/10 text-white/40 cursor-not-allowed"
            }`}
          >
            {isLoading ? "Saving..." : "Next"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
