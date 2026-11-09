import { CheckCircle2, XCircle } from "lucide-react";

// results: [{ index, passed, hidden }]. Never display hidden test inputs/outputs.
export default function TestCaseResults({ results = [] }) {
  if (!results.length) return null;
  return (
    <ul className="list-none p-0 grid gap-1">
      {results.map((r, index) => (
        <li key={index} className={`flex items-center gap-2 ${r.verdict === "Accepted" ? "text-olive-dark" : "text-oxblood"}`}>
          {r.verdict === "Accepted" ? <CheckCircle2 size={16} aria-hidden /> : <XCircle size={16} aria-hidden />}
          {r.hidden ? "Hidden" : "Visible"} test {index + 1}: {r.verdict}
          {!r.hidden && r.time != null && <span className="text-xs">{r.time}s · {r.memory ?? "—"} KB</span>}
        </li>
      ))}
    </ul>
  );
}
