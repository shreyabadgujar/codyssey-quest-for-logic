export default function OutputConsole({ output = "", isRunning = false }) {
  return (
    <pre className="field font-mono text-sm min-h-24 whitespace-pre-wrap" aria-live="polite">
      {isRunning ? "Deciphering…" : output || "The ship's log is empty."}
    </pre>
  );
}
