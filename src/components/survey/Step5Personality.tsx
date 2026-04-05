import { useState } from "react";
import { useSurvey } from "@/context/SurveyContext";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

const mbtiData: Record<string, { title: string; traits: string[]; strengths: string[]; weaknesses: string[] }> = {
  INTJ: {
    title: "The Architect",
    traits: ["Strategic", "Independent", "Analytical", "Decisive", "Private"],
    strengths: ["Long-term planning", "Pattern recognition", "Self-confidence", "Systems thinking"],
    weaknesses: ["Can be dismissive of others' feelings", "Overly critical", "Struggles with spontaneity"],
  },
  INTP: {
    title: "The Logician",
    traits: ["Curious", "Logical", "Inventive", "Detached", "Unconventional"],
    strengths: ["Abstract thinking", "Problem-solving", "Innovation", "Objectivity"],
    weaknesses: ["Procrastination", "Insensitive to emotions", "Difficulty following through"],
  },
  ENTJ: {
    title: "The Commander",
    traits: ["Bold", "Decisive", "Efficient", "Confident", "Ambitious"],
    strengths: ["Leadership", "Strategic execution", "High energy", "Goal orientation"],
    weaknesses: ["Impatient", "Domineering", "Can overlook others' feelings"],
  },
  ENTP: {
    title: "The Debater",
    traits: ["Clever", "Energetic", "Argumentative", "Visionary", "Provocative"],
    strengths: ["Quick thinking", "Creative ideas", "Debate & persuasion", "Adaptability"],
    weaknesses: ["Unfocused", "Bores quickly", "Insensitive", "Avoids routine"],
  },
  INFJ: {
    title: "The Advocate",
    traits: ["Empathetic", "Principled", "Visionary", "Determined", "Private"],
    strengths: ["Deep insight into others", "Long-term vision", "Creative problem-solving"],
    weaknesses: ["Perfectionist", "Burns out easily", "Extremely private", "Sensitive to criticism"],
  },
  INFP: {
    title: "The Mediator",
    traits: ["Idealistic", "Creative", "Empathetic", "Open-minded", "Introspective"],
    strengths: ["Genuine empathy", "Open-mindedness", "Passion for ideas", "Adaptability"],
    weaknesses: ["Overly idealistic", "Self-isolating", "Impractical", "Easily stressed"],
  },
  ENFJ: {
    title: "The Protagonist",
    traits: ["Charismatic", "Altruistic", "Inspiring", "Reliable", "Sensitive"],
    strengths: ["Empathy", "Communication", "Building people up", "Natural leadership"],
    weaknesses: ["Overly selfless", "Too idealistic", "Struggles with tough decisions", "People-pleasing"],
  },
  ENFP: {
    title: "The Campaigner",
    traits: ["Enthusiastic", "Creative", "Sociable", "Optimistic", "Curious"],
    strengths: ["Imagination", "Empathy", "Energizing others", "Cross-connecting ideas"],
    weaknesses: ["Poor focus", "Overthinks", "Emotional volatility", "Dislikes routine"],
  },
  ISTJ: {
    title: "The Logistician",
    traits: ["Responsible", "Thorough", "Dependable", "Methodical", "Reserved"],
    strengths: ["Reliability", "Attention to detail", "Organization", "Integrity"],
    weaknesses: ["Rigid", "Judgmental", "Resistant to change", "Struggles with emotional expression"],
  },
  ISFJ: {
    title: "The Defender",
    traits: ["Warm", "Observant", "Loyal", "Hardworking", "Humble"],
    strengths: ["Supportiveness", "Patience", "Practical care", "Strong memory for details"],
    weaknesses: ["Reluctant to change", "Overly self-sacrificing", "Suppresses feelings", "Easily hurt"],
  },
  ESTJ: {
    title: "The Executive",
    traits: ["Organized", "Direct", "Loyal", "Dedicated", "Traditional"],
    strengths: ["Project management", "Clear communication", "Decisiveness", "Reliability"],
    weaknesses: ["Inflexible", "Stubborn", "Uncomfortable with unconventional ideas", "Judgmental"],
  },
  ESFJ: {
    title: "The Consul",
    traits: ["Caring", "Social", "Popular", "Dutiful", "Sensitive"],
    strengths: ["Building community", "Cooperative teamwork", "Loyalty", "Practical helpfulness"],
    weaknesses: ["Needy for approval", "Inflexible", "Vulnerable to criticism", "Neglects own needs"],
  },
  ISTP: {
    title: "The Virtuoso",
    traits: ["Practical", "Observant", "Logical", "Calm", "Reserved"],
    strengths: ["Crisis management", "Technical mastery", "Hands-on problem solving", "Adaptability"],
    weaknesses: ["Commitment issues", "Risk-taking", "Emotionally distant", "Insensitive"],
  },
  ISFP: {
    title: "The Adventurer",
    traits: ["Gentle", "Sensitive", "Artistic", "Curious", "Unpredictable"],
    strengths: ["Creativity", "Empathy", "Open-mindedness", "Living in the present"],
    weaknesses: ["Fiercely independent (resists structure)", "Easily stressed", "Unpredictable", "Avoids conflict"],
  },
  ESTP: {
    title: "The Entrepreneur",
    traits: ["Bold", "Perceptive", "Energetic", "Sociable", "Direct"],
    strengths: ["Action under pressure", "Negotiation", "Observational acuity", "Boldness"],
    weaknesses: ["Impulsive", "Impatient with theory", "Defiant of rules", "Insensitive"],
  },
  ESFP: {
    title: "The Entertainer",
    traits: ["Spontaneous", "Energetic", "Fun-loving", "Optimistic", "Observant"],
    strengths: ["Humor", "Engaging others", "Practical resourcefulness", "Optimism"],
    weaknesses: ["Poor long-term planning", "Easily bored", "Sensitive to criticism", "Unfocused"],
  },
};

const renderTags = (items: string[], color: string) => (
  <div className="flex flex-wrap gap-2">
    {items.map((item) => (
      <span key={item} className={`text-[10px] md:text-xs font-bold uppercase tracking-wider px-2 py-1 rounded border ${color}`}>
        {item}
      </span>
    ))}
  </div>
);

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
          <p className="text-base md:text-lg font-bold text-primary uppercase tracking-widest mt-1">
            {mbtiData[mbti]?.title ?? mbti}
          </p>

          <div className="space-y-4 mt-4 text-left">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Traits</p>
              {renderTags(mbtiData[mbti]?.traits ?? [], "border-white/20 text-white/70 bg-white/5")}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-2">Strengths</p>
              {renderTags(mbtiData[mbti]?.strengths ?? [], "border-primary/40 text-primary bg-primary/5")}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-400/60 mb-2">Weaknesses</p>
              {renderTags(mbtiData[mbti]?.weaknesses ?? [], "border-red-500/30 text-red-400 bg-red-500/5")}
            </div>
          </div>

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
