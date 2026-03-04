import { useState, useEffect } from "react";

interface Entry {
  date: string;
  amount: number;
}

function getToday(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function useLocalEntries(key: string) {
  const [entries, setEntries] = useState<Entry[]>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(entries));
  }, [entries, key]);

  const addEntry = (amount: number) => {
    setEntries((prev) => [...prev, { date: getToday(), amount }]);
  };

  const deleteEntry = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const total = entries.reduce((sum, e) => sum + e.amount, 0);

  return { entries, addEntry, deleteEntry, total };
}

export { getToday };
