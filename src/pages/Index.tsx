import { useEffect, useCallback, useState } from "react";
import { arSA } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { CalendarDays, Send } from "lucide-react";
import CategoryCard from "@/components/CategoryCard";
import { useLocalEntries, getToday } from "@/hooks/useLocalEntries";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const CATEGORIES = [
  { key: "cash", label: "نقدي" },
  { key: "purchases", label: "مشتريات" },
  { key: "balance", label: "رصيد" },
  { key: "tobacco", label: "دخان" },
  { key: "sales", label: "المبيعات" },
] as const;

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

function isoToDate(isoDate: string): Date | undefined {
  const [yyyy, mm, dd] = isoDate.split("-").map(Number);
  if (!yyyy || !mm || !dd) return undefined;
  return new Date(yyyy, mm - 1, dd);
}

function dateToIso(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayIso());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [pendingWhatsAppSend, setPendingWhatsAppSend] = useState(false);

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
    cash.clearEntries();
    purchases.clearEntries();
    balance.clearEntries();
    tobacco.clearEntries();
    sales.clearEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendWhatsAppReport = useCallback((dateIso: string) => {
    const displayDate = isoToDisplayDate(dateIso);

    const padLine = (label: string, amount: number, amountFirst = false) => {
      const amountStr = amount.toLocaleString("en-US");
      const targetWidth = 24;
      if (amountFirst) {
        const spaces = " ".repeat(
          Math.max(1, targetWidth - amountStr.length)
        );
        return `${amountStr}${spaces}${label}`;
      }
      const spaces = " ".repeat(
        Math.max(1, targetWidth - label.length)
      );
      return `${label}${spaces}${amountStr}`;
    };

    const totalsByKey = new Map(cats.map((c) => [c.key, c.total]));

    const message = [
      displayDate,
      padLine("نقدي", totalsByKey.get("cash") || 0),
      padLine("مشتريات", totalsByKey.get("purchases") || 0),
      padLine("رصيد", totalsByKey.get("balance") || 0),
      padLine("دخان", totalsByKey.get("tobacco") || 0),
      padLine("مبيعات", totalsByKey.get("sales") || 0, true),
    ].join("\n");

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }, [cats]);

  const handleDateChange = useCallback(
    (nextDate: Date | undefined) => {
      if (!nextDate) return;
      const nextIso = dateToIso(nextDate);
      setSelectedDate(nextIso);
      setCalendarOpen(false);
      if (!pendingWhatsAppSend) return;
      setPendingWhatsAppSend(false);
      sendWhatsAppReport(nextIso);
    },
    [pendingWhatsAppSend, sendWhatsAppReport]
  );

  const handleSendWhatsApp = useCallback(() => {
    setPendingWhatsAppSend(true);
    setCalendarOpen(true);
  }, []);

  return (
    <div className="min-h-screen pb-12">
      <header className="sticky top-0 z-10 bg-primary text-primary-foreground py-4 px-4 shadow-sm">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <h1 className="text-lg font-bold">المحاسبة اليومية</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-primary-foreground/80">
              التاريخ
            </span>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex min-w-44 items-center gap-3 overflow-hidden rounded-full border border-white/20 bg-white/12 px-4 py-2 text-primary-foreground shadow-[0_10px_30px_rgba(0,0,0,0.16)] backdrop-blur-sm transition hover:bg-white/18"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                    <CalendarDays className="h-4 w-4" />
                  </span>
                  <span className="flex flex-col text-right leading-tight">
                    <span className="text-[11px] font-medium tracking-[0.2em] text-primary-foreground/55">
                      DATE
                    </span>
                    <span className="text-sm font-semibold">
                      {isoToDisplayDate(selectedDate)}
                    </span>
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                sideOffset={12}
                className="w-auto rounded-[28px] border-white/10 bg-white p-2 text-foreground shadow-[0_24px_80px_rgba(15,23,42,0.22)]"
              >
                <Calendar
                  mode="single"
                  selected={isoToDate(selectedDate)}
                  onSelect={handleDateChange}
                  locale={arSA}
                  dir="rtl"
                  className="rounded-[22px] bg-white"
                  classNames={{
                    months: "flex",
                    month: "space-y-4",
                    caption: "flex items-center justify-between px-2 pt-2",
                    caption_label: "text-base font-semibold text-slate-900",
                    nav: "flex items-center gap-2",
                    nav_button:
                      "h-9 w-9 rounded-full border border-slate-200 bg-white p-0 text-slate-700 opacity-100 hover:bg-slate-100",
                    nav_button_previous: "static",
                    nav_button_next: "static",
                    head_row: "mt-2 flex w-full justify-between",
                    head_cell:
                      "w-10 text-center text-xs font-semibold text-slate-400",
                    row: "mt-2 flex w-full justify-between",
                    cell: "h-10 w-10 p-0 text-center text-sm",
                    day:
                      "h-10 w-10 rounded-2xl text-sm font-medium text-slate-700 hover:bg-slate-100",
                    day_today:
                      "bg-slate-100 text-slate-900 ring-1 ring-slate-200",
                    day_selected:
                      "bg-slate-900 text-white hover:bg-slate-900 hover:text-white focus:bg-slate-900 focus:text-white",
                    day_outside: "text-slate-300 opacity-60",
                  }}
                />
              </PopoverContent>
            </Popover>
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
