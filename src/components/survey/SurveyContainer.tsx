"use client";

import { useSurvey } from "@/context/SurveyContext";
import { AnimatePresence, motion } from "framer-motion";
import Step0Welcome from "./Step0Welcome";
import Step1AboutYou from "./Step1AboutYou";
import Step2GamingHours from "./Step2GamingHours";
import Step3PickGames from "./Step3PickGames";
import Step4Motivation from "./Step4Motivation";
import Step5Personality from "./Step5Personality";
import Step6Series from "./Step6Series";
import Step7Books from "./Step7Books";
import Step8Hobbies from "./Step8Hobbies";
import Step9ThankYou from "./Step9ThankYou";

export default function SurveyContainer() {
  const { step } = useSurvey();

  const renderStep = () => {
    switch (step) {
      case 0: return <Step0Welcome key="step0" />;
      case 1: return <Step1AboutYou key="step1" />;
      case 2: return <Step2GamingHours key="step2" />;
      case 3: return <Step3PickGames key="step3" />;
      case 4: return <Step4Motivation key="step4" />;
      case 5: return <Step5Personality key="step5" />;
      case 6: return <Step6Series key="step6" />;
      case 7: return <Step7Books key="step7" />;
      case 8: return <Step8Hobbies key="step8" />;
      case 9: return <Step9ThankYou key="step9" />;
      default: return <Step0Welcome key="step0" />;
    }
  };

  const stepNames = [
    "Welcome", "About You", "Gaming", "Games", "Motivation", 
    "Personality", "Shows", "Books", "Hobbies", "Done"
  ];

  return (
    <div className="flex-grow flex flex-col w-full h-full relative">
      {/* Progress Bar (Skipped for Step 0 & 9 which are Full Screen distincts) */}
      {step > 0 && step < 9 && (
        <div className="absolute top-0 left-0 w-full h-1 bg-white/5 z-50">
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-secondary to-accent shadow-[0_0_15px_var(--color-secondary)]"
            initial={{ width: 0 }}
            animate={{ width: `${(step / 9) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      )}

      {/* Stepper Dots (only active in middle steps) */}
      {step > 0 && step < 9 && (
        <div className="absolute top-6 left-0 w-full hidden md:flex justify-center z-40">
          <div className="flex items-center gap-2 max-w-3xl px-4 w-full">
            {[1,2,3,4,5,6,7,8].map((idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className={`h-2 w-full rounded-full transition-all duration-500 box-glow ${step >= idx ? 'bg-primary shadow-[0_0_10px_var(--color-primary)]' : 'bg-white/10'}`} />
                <span className={`text-[10px] font-bold uppercase transition-colors ${step >= idx ? 'text-primary' : 'text-white/40'}`}>
                   {stepNames[idx]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={`flex-grow w-full flex flex-col justify-center min-h-[100dvh] relative z-10 ${step > 0 && step < 9 ? 'max-w-5xl mx-auto px-4 py-16' : ''}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -40, filter: "blur(10px)" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={`w-full flex-grow flex flex-col justify-center ${step > 0 && step < 9 ? 'glass-panel box-glow p-6 md:p-12 rounded-3xl mt-12 md:mt-24 mb-12 shadow-2xl relative overflow-hidden' : ''}`}
          >
            {/* Inner Glitch FX for Step Transition */}
            {step > 0 && step < 9 && (
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-primary/5 to-transparent z-[-1] animate-pulse-glow" />
            )}
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
