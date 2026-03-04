import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";

interface Entry {
  date: string;
  amount: number;
}

interface CategoryCardProps {
  title: string;
  storageKey: string;
  entries: Entry[];
  onAdd: (amount: number) => void;
  onDelete: (index: number) => void;
  total: number;
}

const CategoryCard = ({ title, entries, onAdd, onDelete, total }: CategoryCardProps) => {
  const [amount, setAmount] = useState("");

  const handleAdd = () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;
    onAdd(num);
    setAmount("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="المبلغ"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-right"
            min="0"
            step="0.01"
          />
          <Button onClick={handleAdd} size="sm" className="shrink-0 gap-1">
            <Plus className="h-4 w-4" />
            إضافة
          </Button>
        </div>

        {entries.length > 0 && (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-right font-semibold">التاريخ</TableHead>
                  <TableHead className="text-right font-semibold">المبلغ</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-right text-sm">{entry.date}</TableCell>
                    <TableCell className="text-right text-sm font-medium">{entry.amount.toLocaleString("ar-EG")}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => onDelete(i)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-sm font-semibold">الإجمالي:</span>
          <span className="text-lg font-bold">{total.toLocaleString("ar-EG")}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;
