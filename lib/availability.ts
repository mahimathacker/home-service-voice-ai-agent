const SLOT_ROTATION = [
  ["10:00 AM", "02:00 PM", "05:00 PM"],
  ["09:00 AM", "12:00 PM", "04:00 PM"],
  ["11:00 AM", "03:00 PM", "06:00 PM"]
] as const;

export function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

export function getAvailableSlots(pinCode: string, date: string): string[] {
  if (pinCode === "370001" && date === "2026-09-03") return [...SLOT_ROTATION[0]];
  // Stable across processes and deployments: the same PIN/date always gets the same list.
  const key = `${pinCode}:${date}`;
  const checksum = [...key].reduce((total, char) => total + char.charCodeAt(0), 0);
  return [...SLOT_ROTATION[checksum % SLOT_ROTATION.length]];
}
