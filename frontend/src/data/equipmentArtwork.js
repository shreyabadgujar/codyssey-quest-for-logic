const art = {
  frame: { gold: "antique-gold-frame", silver: "silver-explorer-frame", royal: "royal-frame" },
  background: { forest: "enchanted-forest", dunes: "golden-expedition", ocean: "ocean-mystery" },
  pin: { compass: "compass-pin", treasure: "treasure-pin", map: "ancient-map-pin" },
  companion: { owl: "little-owl", fox: "explorer-fox", raven: "tiny-raven" },
};

// Resolve the artwork at render time so previously seeded catalogue records work as-is.
export function equipmentArtwork(item) {
  const variants = Object.hasOwn(art, item.slot) ? art[item.slot] : null;
  const slug = variants && Object.hasOwn(variants, item.visual) ? variants[item.visual] : null;
  return slug ? `/assets/accessories/wardrobe/${slug}.webp` : item.asset;
}
