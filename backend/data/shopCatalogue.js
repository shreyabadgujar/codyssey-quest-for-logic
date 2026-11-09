// Fixed IDs keep inventory references stable across fresh databases and restarts.
const entries = [
  ["frame", "Antique Gold Frame", "A brass-edged mount for a well-travelled portrait.", 35, "gold"],
  ["frame", "Silver Explorer Frame", "A cool silver mount with fine engraved edges.", 55, "silver"],
  ["frame", "Royal Frame", "A double-rimmed gilded mount from the royal archives.", 85, "royal"],
  ["background", "Enchanted Forest", "An old woodland clearing lit by a canopy of green.", 30, "forest", "/assets/islands/tree-of-secrets.webp"],
  ["background", "Golden Expedition", "Sunlit dunes behind the trail of an ancient caravan.", 45, "dunes", "/assets/islands/sorting-sands.webp"],
  ["background", "Ocean Mystery", "A stretch of the illustrated Ætherian sea chart.", 60, "ocean", "/assets/maps/aetheria-map.webp"],
  ["pin", "Compass Pin", "A small brass compass for a well-marked journal.", 20, "compass", "/assets/treasures/compass.webp"],
  ["pin", "Treasure Pin", "A tiny chest to mark the promise of a discovery.", 30, "treasure", "/assets/treasures/treasure-chest.webp"],
  ["pin", "Ancient Map Pin", "A rolled chart stamped with the cartographer’s seal.", 40, "map", "/assets/treasures/ancient-scroll.webp"],
  ["companion", "Little Owl", "A quiet night watchman with a keen eye for clues.", 50, "owl"],
  ["companion", "Explorer Fox", "An inquisitive trail companion who always finds the path home.", 70, "fox"],
  ["companion", "Tiny Raven", "A black-winged courier with a taste for shiny trinkets.", 90, "raven"],
];

module.exports = entries.map(([slot, name, description, price, visual, asset], index) => ({
  _id: "636f646573737973686f70" + (index + 1).toString(16).padStart(2, "0"),
  slot, name, description, price, visual, ...(asset ? { asset } : {}),
}));
