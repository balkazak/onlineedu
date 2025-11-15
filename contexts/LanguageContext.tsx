"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Language = "ru" | "kz";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  ru: {
    home: "Главная",
    courses: "Курсы",
    tests: "Тесты",
    admin: "Админка",
    profile: "Профиль",
    logout: "Выйти",
    login: "Войти",
    register: "Регистрация",
    user: "Пользователь",
  },
  kz: {
    home: "Басты",
    courses: "Курстар",
    tests: "Тесттер",
    admin: "Әкімші",
    profile: "Профиль",
    logout: "Шығу",
    login: "Кіру",
    register: "Тіркелу",
    user: "Пайдаланушы",
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("ru");

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

