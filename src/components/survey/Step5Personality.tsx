import { useState } from "react";
import { useSurvey } from "@/context/SurveyContext";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

const mbtiDescriptions: Record<string, string> = {
  INTJ: "The Architect. Strategic, independent, and driven by logic. You see the big picture and build systems to get there.",
  INTP: "The Logician. Curious, analytical, and inventive. You love pulling apart ideas to see how they work.",
  ENTJ: "The Commander. Bold, decisive, and natural leaders. You see inefficiency and cannot help but fix it.",
  ENTP: "The Debater. Quick-witted, clever, and loves a good argument. You thrive on intellectual sparring.",
  INFJ: "The Advocate. Idealistic, empathetic, and quietly determined. You care deeply and act on your convictions.",
  INFP: "The Mediator. Creative, sensitive, and guided by values. You see beauty and meaning where others see routine.",
  ENFJ: "The Protagonist. Charismatic, inspiring, and deeply caring. You bring out the best in everyone around you.",
  ENFP: "The Campaigner. Enthusiastic, creative, and free-spirited. You see life as full of possibilities.",
  ISTJ: "The Logistician. Reliable, thorough, and devoted to duty. You are the backbone that holds things together.",
  ISFJ: "The Defender. Warm, dedicated, and protective. You quietly take care of everything and everyone.",
  ESTJ: "The Executive. Organized, direct, and committed to order. You get things done and expect the same from others.",
  ESFJ: "The Consul. Caring, social, and eager to help. You create harmony and make sure nobody is left out.",
  ISTP: "The Virtuoso. Practical, observant, and hands-on. You figure things out by taking them apart.",
  ISFP: "The Adventurer. Gentle, sensitive, and artistic. You live in the moment and express yourself through action.",
  ESTP: "The Entrepreneur. Energetic, perceptive, and bold. You dive headfirst into life and figure it out on the fly.",
  ESFP: "The Entertainer. Spontaneous, energetic, and fun-loving. You turn every room into a party.",
};

const questions = [
  { id: "q9", text: "I feel energized around large groups of people and enjoy being the center of attention." },
  { id: "q10", text: "I prefer a quiet evening alone over going out to a party or crowded event." },
  { id: "q11", text: "I keep things organized, follow schedules, and finish tasks well before deadlines." },
  { id: "q12", text: "I tend to act spontaneously and keep my options open rather than planning everything." },
  { id: "q13", text: "I find it easy to feel what others are feeling and I go out of my way to help people." },
  { id: "q14", text: "I make decisions based on logic and analysis rather than emotions or how people might feel." },
  { id: "q15", text: "I get excited by abstract ideas and philosophical discussions more than practical everyday details." },
  { id: "q16", text: "I enjoy trying completely new things like unusual food, unfamiliar music, or unknown travel destinations." },
  { id: "q17", text: "I often worry about things going wrong and feel anxious or stressed more than people around me." },
  { id: "q18", text: "I bounce back quickly from setbacks and rarely dwell on negative emotions." },
];

export default function Step5Personality() {
  const { setStep, responseId, setMbtiType } = useSurvey();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [bigFive, setBigFive] = useState<Record<string, number>>({});
  const [mbti, setMbti] = useState("");

  const currentQ = questions[currentIndex];

  const handleSelect = async (score: number) => {
    const newAnswers = { ...answers, [currentQ.id]: score };
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setTimeout(() => setCurrentIndex((c) => c + 1), 300);
    } else {
      // Finished all questions, calculate
      setIsLoading(true);
      const q9 = newAnswers['q9'];
      const q10 = newAnswers['q10'];
      const q11 = newAnswers['q11'];
      const q12 = newAnswers['q12'];
      const q13 = newAnswers['q13'];
      const q14 = newAnswers['q14'];
      const q15 = newAnswers['q15'];
      const q16 = newAnswers['q16'];
      const q17 = newAnswers['q17'];
      const q18 = newAnswers['q18'];

      // Big Five Calculation
      const bfScores = {
        Extraversion: (q9 + (8 - q10)) / 2,
        Conscientiousness: (q11 + (8 - q12)) / 2,
        Agreeableness: (q13 + (8 - q14)) / 2,
        Openness: (q15 + q16) / 2,
        Neuroticism: (q17 + (8 - q18)) / 2,
      };

      // MBTI Calculation
      const E_vs_I = q9 > q10 ? "E" : q10 > q9 ? "I" : "I";
      const N_vs_S = (q15 + q16) / 2 > 4 ? "N" : "S";
      const T_vs_F = q14 > q13 ? "T" : q13 > q14 ? "F" : "T";
      const J_vs_P = q11 > q12 ? "J" : q12 > q11 ? "P" : "J";
      const calcMbti = `${E_vs_I}${N_vs_S}${T_vs_F}${J_vs_P}`;

      try {
        if (responseId) {
          await supabase
            .from("responses")
            .update({
              personality_responses: newAnswers,
              big_five_scores: bfScores,
              mbti_type: calcMbti,
            })
            .eq("id", responseId);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setBigFive(bfScores);
        setMbti(calcMbti);
        setMbtiType(calcMbti);
        setIsLoading(false);
        setShowResults(true);
      }
    }
  };

  if (showResults) {
    return (
      <div className="flex flex-col items-center max-w-4xl mx-auto space-y-12 w-full py-10 text-center">
        <h2 className="text-3xl md:text-5xl font-bold">Your Personality Profile</h2>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-3xl p-8 max-w-2xl w-full shadow-2xl space-y-4"
        >
          <div className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            {mbti}
          </div>
          <p className="text-lg md:text-xl text-white/80">{mbtiDescriptions[mbti]}</p>
          <a href="https://www.16personalities.com/" target="_blank" rel="noreferrer" className="inline-block mt-4 text-sm text-primary hover:text-primary/80 transition-colors">
            Curious to learn more? Take the full test at 16personalities.com
          </a>
        </motion.div>

        <div className="w-full max-w-2xl space-y-6 text-left">
          <h3 className="text-2xl font-bold text-center mb-6">The Big Five</h3>
          {[
            { name: "Extraversion", color: "#f97316" },
            { name: "Conscientiousness", color: "#3b82f6" },
            { name: "Agreeableness", color: "#22c55e" },
            { name: "Openness", color: "#8b5cf6" },
            { name: "Neuroticism", color: "#ef4444" },
          ].map((trait, idx) => (
            <div key={trait.name} className="space-y-2">
              <div className="flex justify-between font-medium">
                <span>{trait.name}</span>
                <span>{bigFive[trait.name]?.toFixed(1)} / 7</span>
              </div>
              <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(bigFive[trait.name] / 7) * 100}%` }}
                  transition={{ delay: 0.5 + idx * 0.2, duration: 1 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: trait.color }}
                />
              </div>
            </div>
          ))}
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          onClick={() => setStep(6)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-10 py-4 bg-white text-background text-xl font-bold rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-gray-200"
        >
          Continue
        </motion.button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-10 flex flex-col items-center text-center space-y-12">
      <div className="space-y-4">
        <h2 className="text-3xl md:text-5xl font-bold">Let&apos;s get to know the real you.</h2>
        <p className="text-white/60 text-lg">Rate each statement from 1 (Strongly Disagree) to 7 (Strongly Agree).</p>
      </div>

      <div className="w-full relative min-h-[300px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full space-y-10"
          >
            <h3 className="text-2xl md:text-3xl font-medium leading-relaxed">"{currentQ.text}"</h3>
            
            <div className="flex justify-center gap-2 md:gap-4 flex-wrap pb-8">
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <motion.button
                  key={num}
                  onClick={() => handleSelect(num)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-12 h-12 md:w-16 md:h-16 rounded-full text-xl md:text-2xl font-bold flex items-center justify-center transition-all ${
                    answers[currentQ.id] === num
                      ? "bg-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {num}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="text-white/40 font-medium tracking-widest text-sm uppercase">
        {currentIndex + 1} of {questions.length}
      </div>
    </div>
  );
}
