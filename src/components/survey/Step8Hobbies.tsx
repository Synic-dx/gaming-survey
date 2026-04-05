import { useState } from "react";
import { useSurvey } from "@/context/SurveyContext";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { ChevronDown, ChevronUp, Check } from "lucide-react";

const groups = [
  {
    name: "Sports and Physical",
    options: [
      "Cricket", "Football / Soccer", "Badminton / Tennis / Table Tennis",
      "Basketball / Volleyball", "Gym / Weight training / CrossFit",
      "Running / Jogging / Marathon training", "Swimming", "Yoga / Meditation",
      "Trekking / Hiking / Camping", "Cycling / Skateboarding",
      "Martial arts / Boxing / MMA", "Dance (any form)"
    ]
  },
  {
    name: "Creative and Artistic",
    options: [
      "Drawing / Painting / Sketching", "Digital art / Graphic design", "Photography",
      "Videography / Filmmaking / Video editing", "Playing a musical instrument",
      "Singing / Vocals", "Writing fiction or short stories", "Writing poetry",
      "Journaling / Diary writing", "Blogging / Newsletter writing",
      "Calligraphy / Lettering", "Craft / DIY / Origami / Model building", "Cooking / Baking"
    ]
  },
  {
    name: "Intellectual and Technical",
    options: [
      "Coding / Programming / App development", "Robotics / Electronics / Hardware tinkering",
      "Debating / MUN / Public speaking", "Quiz / Trivia competitions",
      "Learning new languages", "Stock market / Investing / Crypto",
      "Solving puzzles (Rubik's cube, jigsaw, logic puzzles)", "Chess (serious / tournament level)"
    ]
  },
  {
    name: "Content and Media",
    options: [
      "Content creation (YouTube, Instagram, Streaming, Podcasting)", "Meme making / Shitposting",
      "Music production / Beatmaking / DJing", "Curating playlists / Music discovery",
      "Film analysis / Reviewing shows and movies", "Writing reviews or threads (Reddit, Letterboxd, Goodreads)"
    ]
  },
  {
    name: "Social and Community",
    options: [
      "Volunteering / NGO work / Social service", "Event management / College fest organizing",
      "Student clubs / Societies / Committee work", "Board games / Card games / D&D (offline)",
      "Hosting or going to house parties / Social gatherings"
    ]
  },
  {
    name: "Collecting and Niche",
    options: [
      "Collecting (coins, stamps, sneakers, figures, vintage items, cards)", "Gardening / Plant care",
      "Pet care / Animal related hobbies", "Astronomy / Stargazing", "Thrifting / Vintage shopping / Fashion curation"
    ]
  }
];

export default function Step8Hobbies() {
  const { setStep, responseId } = useSurvey();
  const [selected, setSelected] = useState<string[]>([]);
  const [openGroups, setOpenGroups] = useState<string[]>([groups[0].name]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleGroup = (name: string) => {
    setOpenGroups((prev) => 
      prev.includes(name) ? prev.filter((g) => g !== name) : [...prev, name]
    );
  };

  const toggleSelection = (opt: string) => {
    if (selected.includes(opt)) {
      setSelected(selected.filter((s) => s !== opt));
    } else {
      if (selected.length < 10) setSelected([...selected, opt]);
    }
  };

  const handleNext = async () => {
    if (selected.length < 3) return;
    setIsLoading(true);
    try {
      if (responseId) {
        await supabase
          .from("responses")
          .update({ hobbies_selected: selected })
          .eq("id", responseId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      setStep(9);
    }
  };

  const maxSelected = selected.length >= 10;

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto space-y-10 w-full py-10 pb-32">
       <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-5xl font-bold">What do you actually do IRL?</h2>
        <p className="text-white/60 text-lg">Pick your top 3 to 10 hobbies.</p>
      </div>

      <div className="flex flex-col w-full gap-4">
        {groups.map((group) => {
          const isOpen = openGroups.includes(group.name);
          const activeCount = group.options.filter(o => selected.includes(o)).length;

          return (
            <div key={group.name} className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5">
              <button
                onClick={() => toggleGroup(group.name)}
                className="flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg">{group.name}</span>
                  {activeCount > 0 && (
                    <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded-full">
                      {activeCount} selected
                    </span>
                  )}
                </div>
                {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {group.options.map((opt) => {
                        const isSelected = selected.includes(opt);
                        const isDisabled = !isSelected && maxSelected;
                        
                        return (
                          <motion.button
                            key={opt}
                            onClick={() => toggleSelection(opt)}
                            whileTap={{ scale: isDisabled ? 1 : 0.95 }}
                            className={`relative text-left p-3 rounded-lg text-sm font-medium transition-colors ${
                              isSelected
                                ? "bg-primary text-white"
                                : "bg-white/5 text-white/80 hover:bg-white/10"
                            } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            <span className="pr-6 block">{opt}</span>
                            {isSelected && (
                              <Check size={14} className="absolute right-3 top-1/2 -translate-y-1/2" strokeWidth={3} />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-background/90 backdrop-blur-md border-t border-white/10 p-4 md:p-6 flex items-center justify-between z-10">
         <div className="text-sm md:text-base font-medium pl-2 md:pl-8">
          <span className={selected.length >= 3 ? "text-primary" : "text-white/60"}>
            {selected.length}
          </span>
          <span className="text-white/60"> / 10 selected (Min 3, Up to 10)</span>
        </div>
        <div className="pr-2 md:pr-8">
          <motion.button
            onClick={handleNext}
            disabled={selected.length < 3 || isLoading}
            className={`px-8 py-3 rounded-full font-bold text-xl transition-colors ${
              selected.length >= 3
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
