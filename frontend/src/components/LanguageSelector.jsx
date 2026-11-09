import { LANGUAGES } from "../game/constants.js";

export default function LanguageSelector({ value, onChange }) {
  return (
    <label className="inline-flex items-center gap-2 font-display">
      Language
      <select className="field w-auto" value={value} onChange={(e) => onChange(e.target.value)}>
        {LANGUAGES.map((l) => <option key={l.key} value={l.key}>{l.label}</option>)}
      </select>
    </label>
  );
}
