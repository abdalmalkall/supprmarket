import { useEffect, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import CategoryCard from "@/components/CategoryCard";
import { useLocalEntries, getToday } from "@/hooks/useLocalEntries";
import HijriDate from "hijri-date/lib/safe";

const CATEGORIES = [
  { key: "cash", label: "نقدي" },
  { key: "purchases", label: "مشتريات" },
  { key: "balance", label: "رصيد" },
  { key: "tobacco", label: "دخان" },
  { key: "sales", label: "المبيعات" },
] as const;

const DATE_STORAGE_KEY = "accounting_selected_date";
const WHATSAPP_NUMBER = "962788888781";

function getTodayIso(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function isoToDisplayDate(isoDate: string): string {
  const [yyyy, mm, dd] = isoDate.split("-");
  if (!yyyy || !mm || !dd) return getToday();
  return `${dd}/${mm}/${yyyy}`;
}

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    try {
      return localStorage.getItem(DATE_STORAGE_KEY) || getTodayIso();
    } catch {
      return getTodayIso();
    }
  });

  const cash = useLocalEntries("accounting_cash");
  const purchases = useLocalEntries("accounting_purchases");
  const balance = useLocalEntries("accounting_balance");
  const tobacco = useLocalEntries("accounting_tobacco");
  const sales = useLocalEntries("accounting_sales");

  const cats = [
    { ...CATEGORIES[0], ...cash },
    { ...CATEGORIES[1], ...purchases },
    { ...CATEGORIES[2], ...balance },
    { ...CATEGORIES[3], ...tobacco },
    { ...CATEGORIES[4], ...sales },
  ];

  useEffect(() => {
    try {
      localStorage.setItem(DATE_STORAGE_KEY, selectedDate);
    } catch {
      // no-op
    }
  }, [selectedDate]);

  useEffect(() => {
    cash.clearEntries();
    purchases.clearEntries();
    balance.clearEntries();
    tobacco.clearEntries();
    sales.clearEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendWhatsApp = useCallback(() => {
    const displayDate = isoToDisplayDate(selectedDate);
    const hijriDate = new HijriDate(new Date(selectedDate));
    const hijriDateStr = `${hijriDate.getDate()} / ${hijriDate.getMonth() + 1} / ${hijriDate.getFullYear()}`;

    const totalsText = cats
      .map((c) => `${c.label}: ${c.total.toLocaleString("ar-EG")}`)
      .join("\n");

    const message = [
      "التقرير اليومي",
      `التاريخ الميلادي: ${displayDate}`,
      `التاريخ الهجري: ${hijriDateStr}`,
      "",
      totalsText,
      "",
      "— نظام المحاسبة اليومية —",
    ].join("\n");

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }, [cats, selectedDate]);

  return (
    <div className="min-h-screen pb-12">
      <header className="sticky top-0 z-10 bg-primary text-primary-foreground py-4 px-4 shadow-sm">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <h1 className="text-lg font-bold">المحاسبة اليومية</h1>
          <div className="flex items-center gap-2 text-sm opacity-90">
            <span>التاريخ:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded border border-white/30 bg-white/10 px-2 py-1 text-primary-foreground"
            />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 mt-6 space-y-4">
        {cats.map((c) => (
          <CategoryCard
            key={c.key}
            title={c.label}
            storageKey={c.key}
            entries={c.entries}
            onAdd={(amount) => c.addEntry(amount, isoToDisplayDate(selectedDate))}
            onDelete={c.deleteEntry}
            total={c.total}
          />
        ))}

        <Button
          onClick={handleSendWhatsApp}
          size="lg"
          className="w-full gap-2 text-base"
        >
          <Send className="h-5 w-5" />
          إرسال التقرير واتساب
        </Button>
      </main>
    </div>
  );
};

export default Index;
