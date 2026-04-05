import { useState } from "react";
import { useSurvey } from "@/context/SurveyContext";
import { motion } from "framer-motion";

const options = ["Less than 3", "3 to 7", "7 to 15", "15 to 25", "More than 25"];

export default function Step2GamingHours() {
  const { setStep, setGamingHours } = useSurvey();
  const [selected, setSelected] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selected) return;

    setIsLoading(true);
    setTimeout(() => {
      setGamingHours(selected);
      setStep(3); // Go to Game Selection
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-12">
      <div className="space-y-4">
        <h2 className="text-3xl md:text-5xl font-bold">
          How much do you game?
        </h2>
        <p className="text-white/60 text-lg">Hours per week spent gaming</p>
      </div>

      <div className="flex flex-col w-full max-w-md gap-4">
        {options.map((opt, idx) => {
          const isSelected = selected === opt;
          return (
            <motion.button
              key={opt}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setSelected(opt)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-5 rounded-2xl text-xl font-medium transition-all ${
                isSelected
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg border border-white/20"
                  : "bg-white/5 border border-white/10 text-white/80 hover:bg-white/10"
              }`}
            >
              {opt}
            </motion.button>
          );
        })}
      </div>

      <motion.button
        onClick={handleSubmit}
        disabled={!selected || isLoading}
        whileHover={{ scale: selected ? 1.05 : 1 }}
        whileTap={{ scale: selected ? 0.95 : 1 }}
        className={`px-12 py-4 rounded-full font-bold text-xl transition-colors ${
          selected
            ? "bg-white text-background hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            : "bg-white/10 text-white/40 cursor-not-allowed"
        }`}
      >
        {isLoading ? "Saving..." : "Next"}
      </motion.button>
    </div>
  );
}
