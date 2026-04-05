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
  age: string;
  setAge: (age: string) => void;
  gender: string;
  setGender: (gender: string) => void;
  education: string;
  setEducation: (education: string) => void;
  gamesSelected: number[];
  setGamesSelected: (games: number[]) => void;
  genreScores: Record<string, number>;
  setGenreScores: (scores: Record<string, number>) => void;
  traitScores: Record<string, number>;
  setTraitScores: (scores: Record<string, number>) => void;
  gamingMotivation: string[];
  setGamingMotivation: (motivation: string[]) => void;
  seriesSelected: string[];
  setSeriesSelected: (series: string[]) => void;
  booksSelected: string[];
  setBooksSelected: (books: string[]) => void;
  hobbiesSelected: string[];
  setHobbiesSelected: (hobbies: string[]) => void;
  startTime: number | null;
  setStartTime: (time: number | null) => void;
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

  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [education, setEducation] = useState("");
  const [gamesSelected, setGamesSelected] = useState<number[]>([]);
  const [genreScores, setGenreScores] = useState<Record<string, number>>({});
  const [traitScores, setTraitScores] = useState<Record<string, number>>({});
  const [gamingMotivation, setGamingMotivation] = useState<string[]>([]);
  const [seriesSelected, setSeriesSelected] = useState<string[]>([]);
  const [booksSelected, setBooksSelected] = useState<string[]>([]);
  const [hobbiesSelected, setHobbiesSelected] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);

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
        age,
        setAge,
        gender,
        setGender,
        education,
        setEducation,
        gamesSelected,
        setGamesSelected,
        genreScores,
        setGenreScores,
        traitScores,
        setTraitScores,
        gamingMotivation,
        setGamingMotivation,
        seriesSelected,
        setSeriesSelected,
        booksSelected,
        setBooksSelected,
        hobbiesSelected,
        setHobbiesSelected,
        startTime,
        setStartTime,
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
