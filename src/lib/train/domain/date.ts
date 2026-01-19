function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}`;
}
