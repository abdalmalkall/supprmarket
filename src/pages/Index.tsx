import { useCallback } from "react";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import CategoryCard from "@/components/CategoryCard";
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

  

  const grandTotal = cats.reduce((s, c) => s + c.total, 0);

  const handleExport = useCallback(async () => {
    // Create a temporary container that's visible but off-screen
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.zIndex = "-1";
    document.body.appendChild(container);

    // Create the report content
    const reportEl = document.createElement("div");
    reportEl.dir = "rtl";
    reportEl.style.fontFamily = "'IBM Plex Sans Arabic', sans-serif";
    reportEl.style.backgroundColor = "#ffffff";
    reportEl.style.color = "#000000";
    reportEl.style.padding = "32px";
    reportEl.style.width = "400px";

    const today = getToday();
    const totalsData = cats.map((c) => ({ label: c.label, amount: c.total }));

    reportEl.innerHTML = `
      <div style="text-align:center;border-bottom:2px solid #000;padding-bottom:16px;margin-bottom:24px;">
        <h2 style="font-size:20px;font-weight:bold;margin:0 0 4px 0;">التقرير اليومي</h2>
        <p style="font-size:14px;color:#666;margin:0;">تاريخ اليوم: ${today}</p>
      </div>
      <div style="margin-bottom:24px;">
        ${totalsData.map((t) => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #ddd;">
            <span style="font-weight:600;">${t.label}</span>
            <span style="font-weight:bold;">${t.amount.toLocaleString("ar-EG")}</span>
          </div>
        `).join("")}
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding-top:16px;border-top:2px solid #000;">
        <span style="font-size:18px;font-weight:bold;">المجموع الكلي</span>
        <span style="font-size:20px;font-weight:bold;">${grandTotal.toLocaleString("ar-EG")}</span>
      </div>
      <p style="text-align:center;font-size:12px;color:#999;margin-top:24px;">— نظام المحاسبة اليومية —</p>
    `;

    container.appendChild(reportEl);

    try {
      const canvas = await html2canvas(reportEl, {
        backgroundColor: "#ffffff",
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = `تقرير-${today.replace(/\//g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      document.body.removeChild(container);
    }
  }, [cats, grandTotal]);

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

    </div>
  );
};

export default Index;
