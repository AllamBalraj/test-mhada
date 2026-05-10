import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

type IncomeStore = {
  amount: number; // annual income in rupees
  percent: number; // affordability % (30-50)
  tenure: number; // loan tenure in years (15-25)
  roi: number; // rate of interest (annual %), default 8
  downPayment: number; // down payment percentage (0-50), default 20
  savedAt: number;
};

type IncomeContextType = {
  income: IncomeStore | null;
  setIncome: (income: IncomeStore | null) => void;
};

const IncomeContext = createContext<IncomeContextType | undefined>(undefined);

export function IncomeProvider({ children }: { children: ReactNode }) {
  const [income, setIncomeState] = useState<IncomeStore | null>(() => {
    try {
      const raw = localStorage.getItem("userIncome");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const updateIncome = useCallback((newIncome: IncomeStore | null) => {
    setIncomeState(newIncome);
    if (newIncome) {
      localStorage.setItem("userIncome", JSON.stringify(newIncome));
    } else {
      localStorage.removeItem("userIncome");
    }
  }, []);

  return (
    <IncomeContext.Provider value={{ income, setIncome: updateIncome }}>
      {children}
    </IncomeContext.Provider>
  );
}

export function useIncome() {
  const context = useContext(IncomeContext);
  if (!context) {
    throw new Error("useIncome must be used within IncomeProvider");
  }
  return context;
}
