// Clickable hotspot on the island map. Position in percent. Hidden object art goes in /assets/objects.
export default function TreasureMarker({ x, y, found = false, onClick }) {
  return (
    <button type="button" onClick={onClick} aria-label={found ? "Object found" : "Search here"}
      className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{ left: `${x}%`, top: `${y}%`, border: found ? "2px solid rgb(var(--c-brass))" : "1px dashed transparent" }} />
  );
}
