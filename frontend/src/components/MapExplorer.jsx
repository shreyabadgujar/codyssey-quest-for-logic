import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { resolveAvatar } from "../data/avatars.js";
import { equipmentArtwork } from "../data/equipmentArtwork.js";
import { getShopItems } from "../services/gameService.js";

function clearMarkerLabels(pin, position) {
  const chart = pin.parentElement;
  const figure = pin.querySelector(".wm-explorer-figure");
  const companion = pin.querySelector(".wm-explorer-companion");
  const bounds = pin.getBoundingClientRect();
  const chartBounds = chart.getBoundingClientRect();
  const landingX = chartBounds.left + chartBounds.width * position.x / 100;
  const landingY = chartBounds.top + chartBounds.height * position.y / 100;
  const origin = landingX - bounds.width / 2;
  const width = Math.min(bounds.width, bounds.height * (figure.naturalWidth / figure.naturalHeight || .36));
  const left = (bounds.width - width) / 2;
  const right = left + width;
  const sprites = [{ left, right, top: landingY - bounds.height }];
  if (companion) sprites.push({ left: companion.offsetLeft, right: companion.offsetLeft + companion.offsetWidth, top: landingY - companion.offsetHeight });
  const obstacles = [...chart.querySelectorAll(".wm-nameplate")].map(element => element.getBoundingClientRect());
  const step = bounds.width / 4;
  const candidates = [0, ...Array.from({ length: 8 }, (_, index) => [-(index + 1) * step, (index + 1) * step]).flat()];

  let bestOffset = 0;
  let bestOverlap = Infinity;
  for (const offset of candidates) {
    const translated = sprites.map(sprite => ({ left: origin + sprite.left + offset, right: origin + sprite.right + offset, top: sprite.top }));
    if (translated.some(sprite => sprite.left < chartBounds.left + 2 || sprite.right > chartBounds.right - 2)) continue;
    const overlap = translated.reduce((total, sprite) => total + obstacles.reduce((area, marker) => {
      const horizontal = Math.max(0, Math.min(sprite.right + 2, marker.right) - Math.max(sprite.left - 2, marker.left));
      const vertical = Math.max(0, Math.min(landingY, marker.bottom) - Math.max(sprite.top, marker.top));
      return area + horizontal * vertical;
    }, 0), 0);
    if (overlap < bestOverlap) {
      bestOffset = offset;
      bestOverlap = overlap;
    }
    if (overlap === 0) break;
  }
  pin.style.setProperty("--wm-explorer-offset", `${bestOffset}px`);
  pin.dataset.displaced = String(bestOffset !== 0);
}

export function MapExplorer({ user, position }) {
  const avatar = resolveAvatar(user.avatar);
  const [catalogue, setCatalogue] = useState([]);
  const [failedSprite, setFailedSprite] = useState(null);
  const pinRef = useRef(null);
  const companionId = user.avatar?.equipped?.companion;

  useEffect(() => {
    if (!companionId) return;
    let active = true;
    getShopItems().then(items => { if (active) setCatalogue(items); }).catch(() => {});
    return () => { active = false; };
  }, [user._id, companionId]);

  const companion = catalogue.find(item => item.slot === "companion" && item.id === companionId && user.inventory?.includes(item.id));
  const companionArt = companion && equipmentArtwork(companion);
  const sprite = `/assets/maps/explorers/${avatar.id}.webp`;

  useLayoutEffect(() => {
    const pin = pinRef.current;
    const place = () => clearMarkerLabels(pin, position);
    place();
    const observer = new ResizeObserver(place);
    observer.observe(pin.parentElement);
    return () => observer.disconnect();
  }, [sprite, companionArt, position.x, position.y]);

  return (
    <div ref={pinRef} className="wm-explorer" data-inset={position.x > 87 ? "east" : undefined} style={{ left: `${position.x}%`, top: `${position.y}%` }}
      role="img" aria-label={`${avatar.name} at ${position.label}${companionArt ? ` with ${companion.name}` : ""}`}>
      <span className="wm-explorer-landing" aria-hidden="true" />
      <span className="wm-explorer-art">
        <span className="wm-explorer-shadow" aria-hidden="true" />
        <img className="wm-explorer-figure" src={failedSprite === sprite ? avatar.src : sprite} alt="" draggable={false}
          onLoad={() => clearMarkerLabels(pinRef.current, position)} onError={() => setFailedSprite(sprite)} />
        {companionArt && <img className="wm-explorer-companion" src={companionArt} alt="" draggable={false} />}
      </span>
    </div>
  );
}
