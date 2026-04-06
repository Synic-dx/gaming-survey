import { useState } from "react";
import { useSurvey } from "@/context/SurveyContext";
import { motion } from "framer-motion";

const gamingOptions = ["I don't play games", "Less than 3", "3 to 7", "7 to 15", "15 to 25", "More than 25"];

export default function Step2Details() {
  const { 
    setGamingHours, gamingHours,
    setReadsBooks, readsBooks,
    setWatchesSeries, watchesSeries,
    setHasHobbies, hasHobbies,
    proceedFrom
  } = useSurvey();
  
  const [localGaming, setLocalGaming] = useState<string | null>(gamingHours || null);
  const [localBooks, setLocalBooks] = useState<boolean | null>(readsBooks);
  const [localSeries, setLocalSeries] = useState<boolean | null>(watchesSeries);
  const [localHobbies, setLocalHobbies] = useState<boolean | null>(hasHobbies);
  
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!localGaming || localBooks === null || localSeries === null || localHobbies === null) return;

    setIsLoading(true);
    setTimeout(() => {
      setGamingHours(localGaming);
      setReadsBooks(localBooks);
      setWatchesSeries(localSeries);
      setHasHobbies(localHobbies);
      proceedFrom(2); 
      setIsLoading(false);
    }, 400);
  };

  const isComplete = localGaming !== null && localBooks !== null && localSeries !== null && localHobbies !== null;

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-10 py-6 max-w-2xl mx-auto w-full">
      <div className="space-y-4">
        <h2 className="text-3xl md:text-5xl font-bold">
          The Details
        </h2>
        <p className="text-white/60 text-lg">A quick check before we dive deep</p>
      </div>

      <div className="flex flex-col w-full gap-8 text-left">
        {/* Gaming */}
        <div className="space-y-3">
          <label className="text-xl font-bold text-white/90 px-2">How much do you game? <span className="text-white/40 text-sm font-normal">(Hours/week)</span></label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {gamingOptions.map((opt) => (
              <motion.button
                key={opt}
                onClick={() => setLocalGaming(opt)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-4 rounded-xl text-sm md:text-base font-medium transition-all ${
                  localGaming === opt
                    ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg border border-white/20"
                    : "bg-white/5 border border-white/10 text-white/80 hover:bg-white/10"
                }`}
              >
                {opt}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Books */}
        <div className="space-y-3">
          <label className="text-xl font-bold text-white/90 px-2">Do you read books?</label>
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              onClick={() => setLocalBooks(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`py-4 rounded-xl font-medium transition-all ${
                localBooks === true
                  ? "bg-primary/20 text-primary border-2 border-primary"
                  : "bg-white/5 border-2 border-transparent text-white/80 hover:bg-white/10"
              }`}
            >
              Yes
            </motion.button>
            <motion.button
              onClick={() => setLocalBooks(false)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`py-4 rounded-xl font-medium transition-all ${
                localBooks === false
                  ? "bg-red-500/20 text-red-400 border-2 border-red-500/50"
                  : "bg-white/5 border-2 border-transparent text-white/80 hover:bg-white/10"
              }`}
            >
              No
            </motion.button>
          </div>
        </div>

        {/* Series */}
        <div className="space-y-3">
          <label className="text-xl font-bold text-white/90 px-2">Do you binge series/shows?</label>
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              onClick={() => setLocalSeries(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`py-4 rounded-xl font-medium transition-all ${
                localSeries === true
                  ? "bg-primary/20 text-primary border-2 border-primary"
                  : "bg-white/5 border-2 border-transparent text-white/80 hover:bg-white/10"
              }`}
            >
              Yes
            </motion.button>
            <motion.button
              onClick={() => setLocalSeries(false)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`py-4 rounded-xl font-medium transition-all ${
                localSeries === false
                  ? "bg-red-500/20 text-red-400 border-2 border-red-500/50"
                  : "bg-white/5 border-2 border-transparent text-white/80 hover:bg-white/10"
              }`}
            >
              No
            </motion.button>
          </div>
        </div>

        {/* Hobbies */}
        <div className="space-y-3">
          <label className="text-xl font-bold text-white/90 px-2">Do you have other hobbies? <span className="text-white/40 text-sm font-normal">(Sports, arts, tech)</span></label>
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              onClick={() => setLocalHobbies(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`py-4 rounded-xl font-medium transition-all ${
                localHobbies === true
                  ? "bg-primary/20 text-primary border-2 border-primary"
                  : "bg-white/5 border-2 border-transparent text-white/80 hover:bg-white/10"
              }`}
            >
              Yes
            </motion.button>
            <motion.button
              onClick={() => setLocalHobbies(false)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`py-4 rounded-xl font-medium transition-all ${
                localHobbies === false
                  ? "bg-red-500/20 text-red-400 border-2 border-red-500/50"
                  : "bg-white/5 border-2 border-transparent text-white/80 hover:bg-white/10"
              }`}
            >
              No
            </motion.button>
          </div>
        </div>
      </div>

      <motion.button
        onClick={handleSubmit}
        disabled={!isComplete || isLoading}
        whileHover={{ scale: isComplete ? 1.05 : 1 }}
        whileTap={{ scale: isComplete ? 0.95 : 1 }}
        className={`px-12 py-4 mt-8 rounded-full font-bold text-xl transition-colors ${
          isComplete
            ? "bg-white text-background hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            : "bg-white/10 text-white/40 cursor-not-allowed"
        }`}
      >
        {isLoading ? "Saving..." : "Next"}
      </motion.button>
    </div>
  );
}
