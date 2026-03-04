import { forwardRef } from "react";

interface SummaryReportProps {
  date: string;
  totals: { label: string; amount: number }[];
  grandTotal: number;
}

const SummaryReport = forwardRef<HTMLDivElement, SummaryReportProps>(
  ({ date, totals, grandTotal }, ref) => {
    return (
      <div
        ref={ref}
        className="bg-card p-8 w-[400px] mx-auto"
        style={{ direction: "rtl", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
      >
        <div className="text-center border-b-2 border-foreground pb-4 mb-6">
          <h2 className="text-xl font-bold mb-1">التقرير اليومي</h2>
          <p className="text-sm text-muted-foreground">{date}</p>
        </div>

        <div className="space-y-3 mb-6">
          {totals.map((item, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-border">
              <span className="font-semibold">{item.label}</span>
              <span className="font-bold">{item.amount.toLocaleString("ar-EG")}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-4 border-t-2 border-foreground">
          <span className="text-lg font-bold">المجموع الكلي</span>
          <span className="text-xl font-bold">{grandTotal.toLocaleString("ar-EG")}</span>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">— نظام المحاسبة اليومية —</p>
      </div>
    );
  }
);

SummaryReport.displayName = "SummaryReport";

export default SummaryReport;
