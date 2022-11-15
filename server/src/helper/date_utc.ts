export function dateUTC(date: number): Date {
  const utc = new Date().getTimezoneOffset();
  const now: Date = new Date(date - utc * 60000);
  return now;
}
