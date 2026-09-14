import { Card } from "@/components/ui/Card";

export function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="flex flex-col items-center gap-1 py-4 text-center">
      <span className="text-2xl font-semibold">{value}</span>
      <span className="text-sm text-muted">{label}</span>
    </Card>
  );
}
