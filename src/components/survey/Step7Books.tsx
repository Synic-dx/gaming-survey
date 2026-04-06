import { useState, useEffect } from "react";
import { useSurvey } from "@/context/SurveyContext";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Check } from "lucide-react";

const NO_READ_OPTION = "Only time I picked a book was for clearing IPMAT VA";

const options = [
  NO_READ_OPTION,
  "Literary Fiction / Classics (The Kite Runner, A Fine Balance, 1984, Animal Farm, Norwegian Wood, To Kill a Mockingbird, The Great Gatsby)",
  "Fantasy / Sci-Fi (Harry Potter, Dune, LOTR, Mistborn, Foundation, Hitchhiker's Guide)",
  "Mystery / Thriller (Da Vinci Code, Agatha Christie, Gone Girl, Sidney Sheldon)",
  "Dark / Psychological Fiction (Dostoevsky, Kafka, Camus, Notes from Underground, The Stranger, The Trial)",
  "Comedy / Satire / Wit (Catch-22, Three Men in a Boat, P.G. Wodehouse, Roald Dahl, Douglas Adams)",
  "Romance (Colleen Hoover, Nicholas Sparks, Jane Austen, Pride and Prejudice)",
  "Self-Help / Personal Growth (Atomic Habits, Ikigai, Subtle Art, Deep Work)",
  "Business / Finance / Entrepreneurship (Zero to One, Psychology of Money, Rich Dad Poor Dad)",
  "Biography / Memoir (Steve Jobs, Wings of Fire, Shoe Dog, Becoming, Born a Crime)",
  "Manga / Comics / Graphic Novels (One Piece, Naruto, Berserk, Chainsaw Man, Maus)",
  "History / Philosophy / Science (Sapiens, Thinking Fast and Slow, Meditations, A Brief History of Time)",
  "Poetry (Rumi, Rupi Kaur, Sylvia Plath, Pablo Neruda, Faiz Ahmed Faiz)",
  "Children's / Young Adult that you still love (Roald Dahl, Diary of a Wimpy Kid, Percy Jackson, Enid Blyton, Tintin, Ruskin Bond)",
];

export default function Step7Books() {
  const { setStep, responseId, proceedFrom } = useSurvey();
  const [selected, setSelected] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleSelection = (opt: string) => {
    if (opt === NO_READ_OPTION) {
      if (selected.includes(NO_READ_OPTION)) {
        setSelected([]);
      } else {
        setSelected([NO_READ_OPTION]);
      }
      return;
    }

    if (selected.includes(NO_READ_OPTION)) {
      setSelected([opt]);
      return;
    }

    if (selected.includes(opt)) {
      setSelected(selected.filter((s) => s !== opt));
    } else {
      if (selected.length < 5) setSelected([...selected, opt]);
    }
  };

  useEffect(() => {
    if (selected.length === 5 || selected.includes(NO_READ_OPTION)) {
      const t = setTimeout(() => {
        handleNext();
      }, 600);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const handleNext = async () => {
    if (selected.length === 0) return;
    setIsLoading(true);
    try {
      if (responseId) {
        await supabase
          .from("responses")
          .update({ books_selected: selected })
          .eq("id", responseId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      proceedFrom(7);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-3xl mx-auto space-y-10 w-full py-10 pb-32">
       <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">
          What do you read?
        </h2>
        <p className="text-white/60 text-lg">Pick your top 1 to 5. Be honest.</p>
      </div>

      <div className="flex flex-col gap-3 w-full">
        {options.map((opt, idx) => {
          const isSelected = selected.includes(opt);
          const isDisabled = !isSelected && selected.length >= 5 && !selected.includes(NO_READ_OPTION) && opt !== NO_READ_OPTION;
          
          return (
            <motion.button
              key={opt}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => toggleSelection(opt)}
              whileTap={{ scale: isDisabled ? 1 : 0.98 }}
              className={`relative flex items-center justify-between w-full p-4 rounded-2xl text-left transition-all ${
                isSelected
                  ? "bg-accent/20 border-2 border-accent"
                  : "bg-white/5 border-2 border-transparent hover:bg-white/10"
              } ${isDisabled ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              <span className="font-medium pr-8">{opt}</span>
              {isSelected && (
                <div className="absolute right-4 rounded-full bg-accent p-1 text-white shadow-md">
                  <Check size={16} strokeWidth={3} />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-background/90 backdrop-blur-md border-t border-white/10 p-4 md:p-6 flex items-center justify-between z-10">
         <div className="text-sm md:text-base font-medium pl-2 md:pl-8">
          <span className={selected.length >= 1 || selected.includes(NO_READ_OPTION) ? "text-accent" : "text-white/60"}>
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
                ? "bg-accent text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] hover:bg-accent/90"
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
