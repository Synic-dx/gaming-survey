"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface SurveyContextType {
  step: number;
  setStep: (step: number) => void;
  responseId: string | null;
  setResponseId: (id: string | null) => void;
  userName: string;
  setUserName: (name: string) => void;
  mbtiType: string;
  setMbtiType: (type: string) => void;
  topGenres: string[];
  setTopGenres: (genres: string[]) => void;
  platform: string;
  setPlatform: (platform: string) => void;
  gamingHours: string;
  setGamingHours: (hours: string) => void;
  premiumnessAvg: number;
  setPremiumnessAvg: (avg: number) => void;
  laptopPrice: string;
  setLaptopPrice: (price: string) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const SurveyContext = createContext<SurveyContextType | undefined>(undefined);

export function SurveyProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState(0);
  const [responseId, setResponseId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [mbtiType, setMbtiType] = useState("");
  const [topGenres, setTopGenres] = useState<string[]>([]);
  const [platform, setPlatform] = useState("");
  const [gamingHours, setGamingHours] = useState("");
  const [premiumnessAvg, setPremiumnessAvg] = useState(0);
  const [laptopPrice, setLaptopPrice] = useState("");

  const nextStep = () => setStep((s) => Math.min(s + 1, 9));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <SurveyContext.Provider
      value={{
        step,
        setStep,
        responseId,
        setResponseId,
        userName,
        setUserName,
        mbtiType,
        setMbtiType,
        topGenres,
        setTopGenres,
        platform,
        setPlatform,
        gamingHours,
        setGamingHours,
        premiumnessAvg,
        setPremiumnessAvg,
        laptopPrice,
        setLaptopPrice,
        nextStep,
        prevStep,
      }}
    >
      {children}
    </SurveyContext.Provider>
  );
}

export function useSurvey() {
  const context = useContext(SurveyContext);
  if (context === undefined) {
    throw new Error("useSurvey must be used within a SurveyProvider");
  }
  return context;
}
