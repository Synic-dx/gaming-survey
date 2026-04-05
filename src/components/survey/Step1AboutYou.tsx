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
    options: ["High School", "Undergraduate"],
  },
  {
    id: "laptop_price",
    text: "Price range of your primary laptop or PC",
    options: [
      "I do not own one",
      "Below 50,000",
      "50,000 to 1,00,000",
      "1,00,000 to 1,50,000",
      "Above 1,50,000",
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
  const { setStep, responseId, setPlatform, setLaptopPrice } = useSurvey();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSelect = (qId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const isComplete = questions.every((q) => answers[q.id]);

  const handleSubmit = async () => {
    if (!isComplete) return;

    setIsLoading(true);
    try {
      if (responseId) {
        await supabase
          .from("responses")
          .update({
            age: answers.age,
            gender: answers.gender,
            education: answers.education,
            laptop_price: answers.laptop_price,
            platform: answers.platform,
          })
          .eq("id", responseId);
      }

      // Update global state for later use
      setPlatform(answers.platform);
      setLaptopPrice(answers.laptop_price);

      // Skip logic
      if (answers.platform === "I do not play games") {
        setStep(5); // Skip gaming questions, go to Personality
      } else {
        setStep(2); // Next step: Gaming Hours
      }
    } catch (err) {
      console.error(err);
      // Fallback: just proceed
      setPlatform(answers.platform);
      setLaptopPrice(answers.laptop_price);
      if (answers.platform === "I do not play games") setStep(5);
      else setStep(2);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full py-8 space-y-12">
      <div className="text-center space-y-2">
        <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          About You
        </h2>
        <p className="text-white/60">Let&apos;s get the boring stuff out of the way.</p>
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
                    whileTap={{ scale: 0.95 }}
                    className={`relative px-5 py-3 rounded-full text-sm md:text-base font-medium transition-all ${
                      isSelected
                        ? "bg-primary/20 text-white border-2 border-primary"
                        : "bg-white/5 border-2 border-transparent text-white/70 hover:bg-white/10"
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
          whileHover={{ scale: isComplete ? 1.05 : 1 }}
          whileTap={{ scale: isComplete ? 0.95 : 1 }}
          className={`px-12 py-4 rounded-full font-bold text-xl transition-colors ${
            isComplete
              ? "bg-primary text-white hover:bg-primary/90 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
              : "bg-white/10 text-white/40 cursor-not-allowed"
          }`}
        >
          {isLoading ? "Saving..." : "Next"}
        </motion.button>
      </div>
    </div>
  );
}
