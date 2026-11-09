// Styled stand-in for missing illustrations (islands, objects, characters).
export default function ArtPlaceholder({ label = "Illustration pending", className = "", style }) {
  return (
    <div className={`flex items-center justify-center text-center p-3 annotation text-sm ${className}`}
      style={{ border: "1px dashed rgb(var(--c-sepia))", background: "rgb(var(--c-parchment-dark) / 0.35)", ...style }}>
      {label}
    </div>
  );
}
