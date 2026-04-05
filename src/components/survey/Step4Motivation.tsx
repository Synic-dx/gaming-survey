import { useState } from "react";
import { useSurvey } from "@/context/SurveyContext";
import { motion } from "framer-motion";

const motives = [
  "To relax and de-stress",
  "To escape boredom or real life",
  "To compete and win",
  "To hang out with friends",
  "For the story and experience",
  "To improve my skills",
  "For the thrill and adrenaline",
  "To kill time",
];

export default function Step4Motivation() {
  const { setStep, setGamingMotivation } = useSurvey();
  const [selected, setSelected] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleSelection = (motive: string) => {
    if (selected.includes(motive)) {
      setSelected(selected.filter((s) => s !== motive));
    } else {
      if (selected.length < 3) {
        setSelected([...selected, motive]);
      }
    }
  };

  const handleNext = async () => {
    if (selected.length === 0) return; // Must have at least 1, max 3

    setIsLoading(true);
    setTimeout(() => {
      setGamingMotivation(selected);
      setStep(5); // Go to Personality
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-12 py-10 w-full text-center">
      <div className="space-y-4">
        <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          Why do you play?
        </h2>
        <p className="text-white/60 text-lg">Pick your top 3 reasons.</p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 max-w-3xl">
        {motives.map((m, idx) => {
          const isSelected = selected.includes(m);
          return (
            <motion.button
              key={m}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => toggleSelection(m)}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              className={`px-6 py-4 rounded-full font-medium transition-all ${
                isSelected
                  ? "bg-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] border-transparent"
                  : "bg-white/5 text-white/80 border border-white/10 hover:bg-white/10"
              } ${
                !isSelected && selected.length >= 3 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {m}
            </motion.button>
          );
        })}
      </div>

      <motion.button
        onClick={handleNext}
        disabled={selected.length === 0 || isLoading}
        whileHover={{ scale: selected.length > 0 ? 1.05 : 1 }}
        whileTap={{ scale: selected.length > 0 ? 0.95 : 1 }}
        className={`px-12 py-4 rounded-full font-bold text-xl transition-colors ${
          selected.length > 0
            ? "bg-white text-background hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            : "bg-white/10 text-white/40 cursor-not-allowed"
        }`}
      >
        {isLoading ? "Saving..." : "Next"}
      </motion.button>
    </div>
  );
}
