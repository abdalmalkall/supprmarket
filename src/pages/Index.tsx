import { useRef, useCallback } from "react";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import CategoryCard from "@/components/CategoryCard";
import SummaryReport from "@/components/SummaryReport";
import { useLocalEntries, getToday } from "@/hooks/useLocalEntries";

const CATEGORIES = [
  { key: "cash", label: "نقدي" },
  { key: "purchases", label: "مشتريات" },
  { key: "balance", label: "رصيد" },
  { key: "tobacco", label: "دخان" },
] as const;

const Index = () => {
  const cash = useLocalEntries("accounting_cash");
  const purchases = useLocalEntries("accounting_purchases");
  const balance = useLocalEntries("accounting_balance");
  const tobacco = useLocalEntries("accounting_tobacco");

  const cats = [
    { ...CATEGORIES[0], ...cash },
    { ...CATEGORIES[1], ...purchases },
    { ...CATEGORIES[2], ...balance },
    { ...CATEGORIES[3], ...tobacco },
  ];

  const reportRef = useRef<HTMLDivElement>(null);

  const grandTotal = cats.reduce((s, c) => s + c.total, 0);

  const handleExport = useCallback(async () => {
    if (!reportRef.current) return;
    reportRef.current.style.display = "block";
    try {
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = `تقرير-${getToday().replace(/\//g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      reportRef.current.style.display = "none";
    }
  }, []);

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-primary text-primary-foreground py-4 px-4 shadow-sm">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <h1 className="text-lg font-bold">المحاسبة اليومية</h1>
          <span className="text-sm opacity-90">تاريخ اليوم: {getToday()}</span>
        </div>
      </header>

      {/* Cards */}
      <main className="max-w-2xl mx-auto px-4 mt-6 space-y-4">
        {cats.map((c) => (
          <CategoryCard
            key={c.key}
            title={c.label}
            storageKey={c.key}
            entries={c.entries}
            onAdd={c.addEntry}
            onDelete={c.deleteEntry}
            total={c.total}
          />
        ))}

        {/* Export Button */}
        <Button
          onClick={handleExport}
          size="lg"
          className="w-full gap-2 text-base"
        >
          <Download className="h-5 w-5" />
          حفظ التقرير كصورة
        </Button>
      </main>

      {/* Hidden report for export */}
      <div style={{ display: "none" }}>
        <SummaryReport
          ref={reportRef}
          date={`تاريخ اليوم: ${getToday()}`}
          totals={cats.map((c) => ({ label: c.label, amount: c.total }))}
          grandTotal={grandTotal}
        />
      </div>
    </div>
  );
};

export default Index;
