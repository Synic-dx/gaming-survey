import { useState } from "react";
import { useSurvey } from "@/context/SurveyContext";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

const questions = [
  {
    id: "age",
    text: "Age",
    options: ["Less than 17", "17 to 18", "19 to 20", "21 to 22", "More than 22"],
  },
  {
    id: "gender",
    text: "Gender",
    options: ["Male", "Female", "Other"],
  },
  {
    id: "education",
    text: "Educational Status",
    options: ["Currently enrolled in: High School", "Currently enrolled in: Undergraduate Degree"],
  },
  {
    id: "laptop_price",
    text: "Price range of your primary laptop or PC",
    options: [
      "I do not own one",
      "Below 30,000",
      "30,000 to 60,000",
      "60,000 to 90,000",
      "90,000 to 1,20,000",
      "Above 1,20,000",
    ],
  },
  {
    id: "platform",
    text: "Primary gaming platform",
    options: [
      "Mobile phone",
      "Laptop / PC",
      "Console (PS, Xbox, Switch)",
      "I do not play games",
    ],
  },
];

export default function Step1AboutYou() {
  const { setStep, setAge, setGender, setEducation, setPlatform, setLaptopPrice } = useSurvey();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSelect = (qId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const isComplete = questions.every((q) => answers[q.id]);

  const handleSubmit = async () => {
    if (!isComplete) return;

    setIsLoading(true);
    // Simulate slight loading latency
    setTimeout(() => {
      setAge(answers.age);
      setGender(answers.gender);
      setEducation(answers.education);
      setPlatform(answers.platform);
      setLaptopPrice(answers.laptop_price);

      if (answers.platform === "I do not play games") {
        setStep(5); // Skip to Personality
      } else {
        setStep(2);
      }
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="w-full py-8 space-y-12">
      <div className="text-center space-y-2">
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-widest text-glow-secondary font-sans">
          About You
        </h2>
        <p className="text-primary/80 font-mono tracking-widest uppercase">Let&apos;s get the boring stuff out of the way.</p>
      </div>

      <div className="space-y-10 max-w-2xl mx-auto">
        {questions.map((q, idx) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-medium">{q.text}</h3>
            <div className="flex flex-wrap gap-3">
              {q.options.map((opt) => {
                const isSelected = answers[q.id] === opt;
                return (
                  <motion.button
                    key={opt}
                    onClick={() => handleSelect(q.id, opt)}
                    whileHover={{ filter: "brightness(1.5)" }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative px-6 py-3 rounded-md text-sm md:text-base font-black tracking-widest uppercase transition-all border-2 ${
                      isSelected
                        ? "bg-primary/10 text-primary border-primary shadow-[0_0_15px_rgba(0,241,255,0.4)] box-glow text-glow"
                        : "bg-white/5 border-white/10 text-white/50 hover:border-primary/50"
                    }`}
                  >
                    {opt}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center pt-8 pb-16">
        <motion.button
          onClick={handleSubmit}
          disabled={!isComplete || isLoading}
          whileHover={{ scale: isComplete ? 1.05 : 1, filter: "brightness(1.2)" }}
          whileTap={{ scale: isComplete ? 0.95 : 1 }}
          className={`px-12 py-4 rounded-md font-black uppercase tracking-[0.2em] transition-all border-2 ${
            isComplete
              ? "bg-primary/10 text-primary border-primary hover:bg-primary/30 shadow-[0_0_25px_rgba(0,241,255,0.5)] text-glow"
              : "bg-white/5 border-white/10 text-white/30 cursor-not-allowed"
          }`}
        >
          {isLoading ? "UPLOADING..." : "PROCEED"}
        </motion.button>
      </div>
    </div>
  );
}
