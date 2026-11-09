// Journal-style framed panel. Use for hero art, maps and illustrations.
export default function OrnateFrame({ children, className = "" }) {
  return (
    <div className={`paper relative p-3 ${className}`} style={{ border: "3px double rgb(var(--c-ink))" }}>
      <div style={{ border: "1px solid rgb(var(--c-brass))" }} className="h-full">{children}</div>
    </div>
  );
}
