import Editor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import EditorWorker from "monaco-editor/editor/editor.worker.js?worker";
import { LANGUAGES } from "../game/constants.js";

// Thin wrapper so theme/options live in one place. Code is only ever sent to the backend.
self.MonacoEnvironment = { getWorker: () => new EditorWorker() };
loader.config({ monaco });

export default function CodeEditorWrapper({ language = "python", value, onChange, height = "520px", readOnly = false }) {
  const monacoLang = LANGUAGES.find((l) => l.key === language)?.monaco ?? "plaintext";
  return (
    <div style={{ border: "2px solid rgb(var(--c-ink))" }}>
      <Editor height={height} theme="vs-dark" language={monacoLang} value={value} onChange={(v) => onChange?.(v ?? "")}
        loading={<p className="paper p-4">Opening the coding laboratory…</p>}
        options={{ readOnly, editContext: false, ariaLabel: "Mission code editor", minimap: { enabled: false }, fontSize: 15,
          lineHeight: 24, tabSize: 4, insertSpaces: true, automaticLayout: true, scrollBeyondLastLine: false,
          lineNumbers: "on", folding: true, autoIndent: "full", matchBrackets: "always", padding: { top: 16, bottom: 16 } }} />
    </div>
  );
}
