const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draf" },
  { value: "PUBLISHED", label: "Terbit" },
  { value: "ARCHIVED", label: "Diarsipkan" },
] as const;

export function StatusSelect({ id, defaultValue }: { id: string; defaultValue: string }) {
  return (
    <select
      id={id}
      name="status"
      defaultValue={defaultValue}
      className="h-11 rounded-lg border border-border bg-surface px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {STATUS_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
