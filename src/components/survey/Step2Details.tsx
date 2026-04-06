import { useState } from "react";
import { useSurvey } from "@/context/SurveyContext";
import { motion } from "framer-motion";

const gamingOptions = ["I don't play games", "Less than 3", "3 to 7", "7 to 15", "15 to 25", "More than 25"];
const platformOptions = ["Mobile phone", "Laptop / PC", "Console (PS, Xbox, Switch)"];
const booksOptions = ["I don't read books", "1-3 books/year", "4-6 books/year", "7-12 books/year", "13-24 books/year", "25+ books/year"];
const seriesOptions = ["I don't watch series", "1-3 shows/year", "4-6 shows/year", "7-12 shows/year", "13-20 shows/year", "20+ shows/year"];

export default function Step2Details() {
  const { 
    setGamingHours, gamingHours,
    setPlatform, platform,
    setReadsBooks, readsBooks,
    setWatchesSeries, watchesSeries,
    setHasHobbies, hasHobbies,
    proceedFrom
  } = useSurvey();
  
  const [localGaming, setLocalGaming] = useState<string | null>(gamingHours || null);
  const [localPlatform, setLocalPlatform] = useState<string | null>(platform || null);
  const [localBooks, setLocalBooks] = useState<string | null>(readsBooks || null);
  const [localSeries, setLocalSeries] = useState<string | null>(watchesSeries || null);
  const [localHobbies, setLocalHobbies] = useState<boolean | null>(hasHobbies);
  
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!localGaming || !localPlatform || !localBooks || !localSeries || localHobbies === null) return;

    setIsLoading(true);
    setTimeout(() => {
      setGamingHours(localGaming);
      setPlatform(localPlatform!);
      setReadsBooks(localBooks);
      setWatchesSeries(localSeries);
      setHasHobbies(localHobbies);
      proceedFrom(2); 
      setIsLoading(false);
    }, 400);
  };

  const isComplete = localGaming !== null && localPlatform !== null && localBooks !== null && localSeries !== null && localHobbies !== null;

  const OptionGrid = ({ 
    options, 
    selected, 
    onSelect, 
    cols = 3 
  }: { 
    options: string[], 
    selected: string | null, 
    onSelect: (v: string) => void, 
    cols?: number 
  }) => (
    <div className={`grid grid-cols-2 md:grid-cols-${cols} gap-3`}>
      {options.map((opt) => (
        <motion.button
          key={opt}
          onClick={() => onSelect(opt)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-4 px-3 rounded-xl text-sm md:text-base font-medium transition-all text-left ${
            selected === opt
              ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg border border-white/20"
              : "bg-white/5 border border-white/10 text-white/80 hover:bg-white/10"
          }`}
        >
          {opt}
        </motion.button>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-10 py-6 max-w-2xl mx-auto w-full">
      <div className="space-y-4">
        <h2 className="text-3xl md:text-5xl font-bold">
          The Details
        </h2>
        <p className="text-white/60 text-lg">A quick check before we dive deep</p>
      </div>

      <div className="flex flex-col w-full gap-8 text-left">
        {/* Platform */}
        <div className="space-y-3">
          <label className="text-xl font-bold text-white/90 px-2">Primary gaming platform</label>
          <OptionGrid options={platformOptions} selected={localPlatform} onSelect={setLocalPlatform} cols={3} />
        </div>

        {/* Gaming */}
        <div className="space-y-3">
          <label className="text-xl font-bold text-white/90 px-2">How much do you game? <span className="text-white/40 text-sm font-normal">(Hours/week)</span></label>
          <OptionGrid options={gamingOptions} selected={localGaming} onSelect={setLocalGaming} />
        </div>

        {/* Books */}
        <div className="space-y-3">
          <label className="text-xl font-bold text-white/90 px-2">How many books do you read? <span className="text-white/40 text-sm font-normal">(Per year)</span></label>
          <OptionGrid options={booksOptions} selected={localBooks} onSelect={setLocalBooks} />
        </div>

        {/* Series */}
        <div className="space-y-3">
          <label className="text-xl font-bold text-white/90 px-2">How many series/shows do you watch? <span className="text-white/40 text-sm font-normal">(Per year)</span></label>
          <OptionGrid options={seriesOptions} selected={localSeries} onSelect={setLocalSeries} />
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
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg border border-white/20"
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
                  ? "bg-white/20 text-white border-2 border-white/40"
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
