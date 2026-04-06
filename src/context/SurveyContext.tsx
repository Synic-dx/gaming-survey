"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

const LS_KEY = "survey_progress";

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return key in parsed ? parsed[key] : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(updates: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    const existing = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    localStorage.setItem(LS_KEY, JSON.stringify({ ...existing, ...updates }));
  } catch {}
}

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
  readsBooks: string | null;
  setReadsBooks: (v: string | null) => void;
  watchesSeries: string | null;
  setWatchesSeries: (v: string | null) => void;
  hasHobbies: boolean | null;
  setHasHobbies: (v: boolean | null) => void;
  startTime: number | null;
  setStartTime: (time: number | null) => void;
  nextStep: () => void;
  prevStep: () => void;
  proceedFrom: (currentStep: number) => void;
}

const SurveyContext = createContext<SurveyContextType | undefined>(undefined);

export function SurveyProvider({ children }: { children: ReactNode }) {
  const [step, _setStep] = useState<number>(() => loadFromStorage("step", 0));
  const [responseId, _setResponseId] = useState<string | null>(() => loadFromStorage("responseId", null));
  const [userName, _setUserName] = useState<string>(() => loadFromStorage("userName", ""));
  const [mbtiType, _setMbtiType] = useState<string>(() => loadFromStorage("mbtiType", ""));
  const [topGenres, _setTopGenres] = useState<string[]>(() => loadFromStorage("topGenres", []));
  const [platform, _setPlatform] = useState<string>(() => loadFromStorage("platform", ""));
  const [gamingHours, _setGamingHours] = useState<string>(() => loadFromStorage("gamingHours", ""));
  const [premiumnessAvg, _setPremiumnessAvg] = useState<number>(() => loadFromStorage("premiumnessAvg", 0));
  const [laptopPrice, _setLaptopPrice] = useState<string>(() => loadFromStorage("laptopPrice", ""));
  const [age, _setAge] = useState<string>(() => loadFromStorage("age", ""));
  const [gender, _setGender] = useState<string>(() => loadFromStorage("gender", ""));
  const [education, _setEducation] = useState<string>(() => loadFromStorage("education", ""));
  const [gamesSelected, _setGamesSelected] = useState<number[]>(() => loadFromStorage("gamesSelected", []));
  const [genreScores, _setGenreScores] = useState<Record<string, number>>(() => loadFromStorage("genreScores", {}));
  const [traitScores, _setTraitScores] = useState<Record<string, number>>(() => loadFromStorage("traitScores", {}));
  const [gamingMotivation, _setGamingMotivation] = useState<string[]>(() => loadFromStorage("gamingMotivation", []));
  const [seriesSelected, _setSeriesSelected] = useState<string[]>(() => loadFromStorage("seriesSelected", []));
  const [booksSelected, _setBooksSelected] = useState<string[]>(() => loadFromStorage("booksSelected", []));
  const [hobbiesSelected, _setHobbiesSelected] = useState<string[]>(() => loadFromStorage("hobbiesSelected", []));
  const [readsBooks, _setReadsBooks] = useState<string | null>(() => loadFromStorage("readsBooks", null));
  const [watchesSeries, _setWatchesSeries] = useState<string | null>(() => loadFromStorage("watchesSeries", null));
  const [hasHobbies, _setHasHobbies] = useState<boolean | null>(() => loadFromStorage("hasHobbies", null));
  const [startTime, _setStartTime] = useState<number | null>(() => loadFromStorage("startTime", null));

  // Wrapped setters — persist every change, clear all on step 9
  const setStep = (v: number) => {
    _setStep(v);
    if (v === 9) localStorage.removeItem(LS_KEY);
    else saveToStorage({ step: v });
  };
  const setResponseId = (v: string | null) => { _setResponseId(v); saveToStorage({ responseId: v }); };
  const setUserName = (v: string) => { _setUserName(v); saveToStorage({ userName: v }); };
  const setMbtiType = (v: string) => { _setMbtiType(v); saveToStorage({ mbtiType: v }); };
  const setTopGenres = (v: string[]) => { _setTopGenres(v); saveToStorage({ topGenres: v }); };
  const setPlatform = (v: string) => { _setPlatform(v); saveToStorage({ platform: v }); };
  const setGamingHours = (v: string) => { _setGamingHours(v); saveToStorage({ gamingHours: v }); };
  const setPremiumnessAvg = (v: number) => { _setPremiumnessAvg(v); saveToStorage({ premiumnessAvg: v }); };
  const setLaptopPrice = (v: string) => { _setLaptopPrice(v); saveToStorage({ laptopPrice: v }); };
  const setAge = (v: string) => { _setAge(v); saveToStorage({ age: v }); };
  const setGender = (v: string) => { _setGender(v); saveToStorage({ gender: v }); };
  const setEducation = (v: string) => { _setEducation(v); saveToStorage({ education: v }); };
  const setGamesSelected = (v: number[]) => { _setGamesSelected(v); saveToStorage({ gamesSelected: v }); };
  const setGenreScores = (v: Record<string, number>) => { _setGenreScores(v); saveToStorage({ genreScores: v }); };
  const setTraitScores = (v: Record<string, number>) => { _setTraitScores(v); saveToStorage({ traitScores: v }); };
  const setGamingMotivation = (v: string[]) => { _setGamingMotivation(v); saveToStorage({ gamingMotivation: v }); };
  const setSeriesSelected = (v: string[]) => { _setSeriesSelected(v); saveToStorage({ seriesSelected: v }); };
  const setBooksSelected = (v: string[]) => { _setBooksSelected(v); saveToStorage({ booksSelected: v }); };
  const setHobbiesSelected = (v: string[]) => { _setHobbiesSelected(v); saveToStorage({ hobbiesSelected: v }); };
  const setReadsBooks = (v: string | null) => { _setReadsBooks(v); saveToStorage({ readsBooks: v }); };
  const setWatchesSeries = (v: string | null) => { _setWatchesSeries(v); saveToStorage({ watchesSeries: v }); };
  const setHasHobbies = (v: boolean | null) => { _setHasHobbies(v); saveToStorage({ hasHobbies: v }); };
  const setStartTime = (v: number | null) => { _setStartTime(v); saveToStorage({ startTime: v }); };

  const nextStep = () => setStep(Math.min(step + 1, 9));
  const prevStep = () => setStep(Math.max(step - 1, 0));

  const proceedFrom = (currentStep: number) => {
    if (currentStep === 2) {
      if (gamingHours === "I don't play games") {
        setStep(5); // Skip directly to personality
      } else {
        setStep(3); // Normal flow (PickGames)
      }
    } else if (currentStep === 5) {
      const willSeries = watchesSeries && watchesSeries !== "I don't watch series";
      const willBooks = readsBooks && readsBooks !== "I don't read books";
      if (willSeries) setStep(6);
      else if (willBooks) setStep(7);
      else if (hasHobbies) setStep(8);
      else setStep(9);
    } else if (currentStep === 6) {
      const willBooks = readsBooks && readsBooks !== "I don't read books";
      if (willBooks) setStep(7);
      else if (hasHobbies) setStep(8);
      else setStep(9);
    } else if (currentStep === 7) {
      if (hasHobbies) setStep(8);
      else setStep(9);
    } else {
      nextStep();
    }
  };

  return (
    <SurveyContext.Provider
      value={{
        step, setStep,
        responseId, setResponseId,
        userName, setUserName,
        mbtiType, setMbtiType,
        topGenres, setTopGenres,
        platform, setPlatform,
        gamingHours, setGamingHours,
        premiumnessAvg, setPremiumnessAvg,
        laptopPrice, setLaptopPrice,
        age, setAge,
        gender, setGender,
        education, setEducation,
        gamesSelected, setGamesSelected,
        genreScores, setGenreScores,
        traitScores, setTraitScores,
        gamingMotivation, setGamingMotivation,
        seriesSelected, setSeriesSelected,
        booksSelected, setBooksSelected,
        hobbiesSelected, setHobbiesSelected,
        readsBooks, setReadsBooks,
        watchesSeries, setWatchesSeries,
        hasHobbies, setHasHobbies,
        startTime, setStartTime,
        nextStep, prevStep, proceedFrom,
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
