const format = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
export function journalDate(at) {
  const date = new Date(at);
  return Number.isFinite(date.getTime()) ? format.format(date) : "";
}
