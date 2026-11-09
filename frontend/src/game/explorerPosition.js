// Shore landmarks on the illustrated map, in percentages of its original dimensions.
export const STARTING_DOCK = { x: 55.4, y: 94.2, label: "Starting dock" };
const LANDINGS = {
  "array-archipelago": { x: 10, y: 40.5 },
  "stringwood-forest": { x: 45.5, y: 30.3 },
  "linked-isles": { x: 37.4, y: 57.2 },
  "stack-queue-depths": { x: 43.7, y: 89.5 },
  "sorting-sands": { x: 22.5, y: 70.3 },
  "searching-peaks": { x: 76.4, y: 21.6 },
  "recursion-realm": { x: 29.7, y: 20.9 },
  "tree-of-secrets": { x: 72.6, y: 43.0 },
  "graphbound-kingdom": { x: 82.0, y: 59.1 },
  "dynamic-programming-dimension": { x: 91.5, y: 37.2 },
};

export function getExplorerPosition(islands, readProgress) {
  let latest = null;
  let completedAt = 0;
  for (const island of islands) {
    const timestamp = Date.parse(readProgress(island.id).lastCompletedAt);
    if (timestamp > completedAt) {
      latest = island;
      completedAt = timestamp;
    }
  }
  if (!latest) return STARTING_DOCK;
  return { ...(LANDINGS[latest.id] ?? latest.mapPosition), label: latest.name };
}
