import { useState } from "react";
import { useSurvey } from "@/context/SurveyContext";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

const mbtiDescriptions: Record<string, string> = {
  INTJ: "The Architect. Deeply strategic and relentlessly independent, you navigate life by logic systems and overarching visions. You excel at long-term planning, anticipating every variable to construct air-tight strategies. In your mind, no problem is unsolvable—it just requires the right algorithm. You don't just participate; you rewrite the rules of engagement.",
  INTP: "The Logician. Your mind is a perpetual engine of curiosity and abstract analysis. Free from the constraints of conventional thinking, you love to dismantle complex systems just to understand their inner workings. You thrive in theoretical playgrounds, constantly experimenting with unorthodox ideas to uncover fundamental truths others completely miss.",
  ENTJ: "The Commander. Bold and decisive, you are a natural force of willpower. When you see inefficiency or chaos, your instinct is to immediately organize and conquer it. You thrive on momentum and high-stakes goals, treating life as a grand chessboard where victory is achieved through unwavering focus and ruthless efficiency.",
  ENTP: "The Debater. Quick-witted, fiercely clever, and deeply energetic, you treat intellectual sparring as a sport. You have an uncanny ability to connect completely unrelated concepts and flip arguments on their head just to test their structural integrity. You thrive on disruption, constantly pushing boundaries to see how systems break and evolve.",
  INFJ: "The Advocate. Guided by profound idealism and intense empathy, you navigate the world with quiet, unrelenting determination. You possess an intricate understanding of human nature, allowing you to see through surface-level noise to the core truth. You don't just want to exist—you want to push society toward a deeply meaningful vision.",
  INFP: "The Mediator. Operating from a deep well of internal values and emotional depth, you are uniquely attuned to the beauty and poetry of life. You seek immense personal meaning in everything you do, viewing the world through a deeply imaginative and empathetic lens. To you, life is a quest for strict moral and artistic authenticity.",
  ENFJ: "The Protagonist. Charismatic and boundlessly inspiring, you naturally draw people into your orbit. You operate heavily on intuition and profound emotional connection, thriving when you can guide others toward their absolute best potential. You are the emotional anchor of any group, seamlessly orchestrating harmony and driving collective, deeply human progress.",
  ENFP: "The Campaigner. Operating with relentless enthusiasm and boundless free-spirited creativity, you view the universe as an interconnected web of chaotic possibilities. You are fiercely independent but deeply compassionate, constantly jumping between wildly different ideas, people, and experiences. You bring an infectious spark to anything that requires out-of-the-box, visionary thinking.",
  ISTJ: "The Logistician. Unshakeably reliable and fiercely devoted to logic, you are the foundational pillar of any functioning system. You process the world through historical data and verifiable facts, ensuring that chaos is subdued by order, routine, and discipline. You don't deal in hypotheticals; you deal in execution and iron-clad integrity.",
  ISFJ: "The Defender. Warm-hearted yet incredibly meticulous, you quietly and diligently maintain the stability of the world around you. You have a highly practical memory, perfectly cataloging details about people and environments to ensure harmony and safety. You are the ultimate protector, shielding your community through relentless, selfless, and structured grace.",
  ESTJ: "The Executive. You are the embodiment of pure order, structure, and direct execution. You bring immediate clarity to messy situations, establishing distinct rules and delegating tasks with unmatched logistical precision. You value deep tradition, strict honesty, and hard work, expecting the world to operate under a predictable, highly effective ethical standard.",
  ESFJ: "The Consul. Highly social, deeply attentive, and practically grounded, you are the primary orchestrator of community and connection. You take immense pride in ensuring everyone feels seen, supported, and included within a highly structured environment. Your social intelligence is unparalleled, turning fractured groups into deeply loyal and cohesive units.",
  ISTP: "The Virtuoso. Operating with a quiet, cool-headed tactical brilliance, you interact with the world through intensely practical, hands-on experimentation. You are a master of tools and mechanics, thriving in environments that require immediate troubleshooting and physical mastery. You don't overthink; you react, adapting to chaotic environments with flawless, instinctual precision.",
  ISFP: "The Adventurer. Defined by a profound internal aesthetic and sensory awareness, you live entirely in the present moment. You reject rigid structures, preferring to navigate life through fluid, artistic expression and deeply personal exploration. You are an observer, soaking in the immediate beauty of the world without the need to control it.",
  ESTP: "The Entrepreneur. Pure kinetic energy and tactical observation characterize your completely fearless approach to reality. You thrive exclusively in the immediate moment, making rapid, high-stakes decisions based entirely on the unfolding sensory data around you. You are an adrenaline-fueled problem solver who prefers to build the parachute after jumping out of the plane.",
  ESFP: "The Entertainer. Spontaneous, fiercely vibrant, and relentlessly fun-loving, you exist to fully experience the absolute maximum joy of life. You have an unmatched tactical awareness of your surroundings and an intense desire to elevate the mood of everyone in the room. Life is a sensory playground, and you are its most dedicated explorer.",
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
  const { 
    setStep, setResponseId, setMbtiType,
    userName, age, gender, education, laptopPrice, platform, gamingHours,
    gamesSelected, premiumnessAvg, topGenres, genreScores, traitScores, gamingMotivation
  } = useSurvey();
  
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
        const { data, error } = await supabase
          .from("responses")
          .insert([{
            name: userName || "Unknown Player",
            age: age || null,
            gender: gender || null,
            education: education || null,
            laptop_price: laptopPrice || null,
            platform: platform || null,
            gaming_hours: gamingHours || null,
            games_selected: gamesSelected,
            premiumness_avg: premiumnessAvg,
            top_genres: topGenres,
            genre_scores: genreScores,
            trait_scores: traitScores,
            gaming_motivation: gamingMotivation,
            personality_responses: newAnswers,
            big_five_scores: bfScores,
            mbti_type: calcMbti,
            completed: false
          }])
          .select()
          .single();
          
        if (error) console.error("Error creating entry:", error);
        if (data) setResponseId(data.id);
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
      <div className="flex flex-col items-center max-w-4xl mx-auto space-y-12 w-full py-10 text-center relative z-10">
        <h2 className="text-3xl md:text-5xl font-black text-glow-secondary uppercase tracking-widest">Psycho-Profile Analyzed</h2>

        <motion.div 
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          className="glass-panel box-glow p-8 rounded-xl border border-primary/20 shadow-[0_0_40px_rgba(0,241,255,0.15)] max-w-2xl w-full space-y-4"
        >
          <div className="text-7xl font-black text-glow tracking-widest">
            {mbti}
          </div>
          <p className="text-lg md:text-xl font-mono text-primary/80 uppercase">[{mbtiDescriptions[mbti]}]</p>
          <a href="https://www.16personalities.com/" target="_blank" rel="noreferrer" className="inline-block mt-4 text-sm font-mono text-secondary hover:text-white transition-colors">
            {">"} ENGAGE DEEP ANALYSIS AT 16PERSONALITIES.COM {"<"}
          </a>
        </motion.div>

        <div className="w-full max-w-2xl space-y-6 text-left glass-panel p-8 rounded-xl">
          <h3 className="text-2xl font-black uppercase text-glow tracking-widest text-center mb-6 border-b border-primary/20 pb-4">Big Five Parameters</h3>
          {[
            { name: "Extraversion", color: "var(--color-premium-4)" },
            { name: "Conscientiousness", color: "var(--color-primary)" },
            { name: "Agreeableness", color: "var(--color-premium-1)" },
            { name: "Openness", color: "var(--color-secondary)" },
            { name: "Neuroticism", color: "var(--color-premium-5)" },
          ].map((trait, idx) => (
            <div key={trait.name} className="space-y-2">
              <div className="flex justify-between font-mono font-bold uppercase tracking-widest text-sm">
                <span className="text-white/80">{trait.name}</span>
                <span className="text-primary">{bigFive[trait.name]?.toFixed(1)} / 7.0</span>
              </div>
              <div className="h-4 bg-black border border-white/10 rounded-sm overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(bigFive[trait.name] / 7) * 100}%` }}
                  transition={{ delay: 0.5 + idx * 0.2, duration: 1 }}
                  className="h-full shadow-[0_0_10px_currentColor]"
                  style={{ backgroundColor: trait.color, color: trait.color }}
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
          whileHover={{ scale: 1.05, filter: "brightness(1.5)" }}
          whileTap={{ scale: 0.95 }}
          className="px-12 py-5 bg-transparent border-2 border-primary text-white text-xl font-black tracking-[0.2em] uppercase rounded-lg shadow-[0_0_30px_rgba(0,241,255,0.4)] hover:bg-primary/20"
        >
          SYSTEM PROCEED
        </motion.button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-10 flex flex-col items-center text-center space-y-12">
      <div className="space-y-4">
        <h2 className="text-3xl md:text-5xl font-black text-glow tracking-widest uppercase font-sans">Let&apos;s get to know the real you.</h2>
        <p className="text-primary/60 text-lg font-mono">RATE CALIBRATION MATRIX: [1] MAX DISAGREE -{">"} [7] MAX AGREE</p>
      </div>

      <div className="w-full relative min-h-[300px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.id}
            initial={{ opacity: 0, x: 50, filter: "blur(5px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -50, filter: "blur(5px)" }}
            transition={{ duration: 0.3 }}
            className="w-full space-y-10 glass-panel p-8 md:p-12 rounded-xl box-glow"
          >
            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-widest leading-relaxed text-secondary/90">"{currentQ.text}"</h3>
            
            <div className="flex justify-center gap-2 md:gap-4 flex-wrap pb-8">
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <motion.button
                  key={num}
                  onClick={() => handleSelect(num)}
                  whileHover={{ scale: 1.1, filter: "brightness(1.5)" }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-12 h-12 md:w-16 md:h-16 rounded-md text-xl md:text-2xl font-black font-mono flex items-center justify-center transition-all border-2 ${
                    answers[currentQ.id] === num
                      ? "bg-primary/20 text-primary border-primary shadow-[0_0_20px_rgba(0,241,255,0.6)] text-glow"
                      : "bg-black/40 border-white/10 text-white/40 hover:border-primary/50 text-glow-secondary"
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
