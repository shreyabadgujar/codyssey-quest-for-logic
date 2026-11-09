export const AVATARS = [
  { id: "explorer-01", name: "The Trail Scout", description: "A green-cloaked scout who reads the shoreline for signs of a passage." },
  { id: "explorer-02", name: "The Wayfinder", description: "A field explorer with a broad-brimmed hat and an eye for uncharted trails." },
  { id: "explorer-03", name: "The Archivist", description: "A sharp-eyed scholar who notices the details others sail past." },
  { id: "explorer-04", name: "The Tidewatcher", description: "A hooded navigator who keeps watch when the fog rolls in." },
].map(avatar => ({ ...avatar, src: `/assets/avatars/${avatar.id}.webp` }));

export function resolveAvatar(saved) {
  const base = typeof saved === "string" ? saved : saved?.base;
  const id = typeof base === "string" ? base.replace(/^\/assets\/avatars\//, "").replace(/\.webp$/, "") : "";
  return AVATARS.find(avatar => avatar.id === id) ?? AVATARS[0];
}
