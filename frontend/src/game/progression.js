import { useState, useEffect } from "react";
import { ISLANDS } from "../data/islands.js";
import { getIslands } from "../services/gameService.js";

let catalogue = [];
let owner = null;
let pending = null;
export async function refreshProgress() {
  const token = localStorage.getItem("codyssey_token");
  if (!token) { catalogue = []; owner = null; return; }
  if (pending && owner === token) return pending;
  if (owner !== token) catalogue = [];
  owner = token;
  pending = getIslands().then(data => {
    if (owner === token) { catalogue = data; window.dispatchEvent(new Event("codyssey:progress-changed")); }
  }).finally(() => { pending = null; });
  return pending;
}
export function getIslandProgress(islandId) {
  const island = owner === localStorage.getItem("codyssey_token") ? catalogue.find(i => i.id === islandId) : null;
  const levels = island?.levels || [];
  const completed = levels.filter(l => l.status === "completed").map(l => l.level);
  const unlocked = levels.filter(l => l.status !== "locked").map(l => l.level);
  const totalLevels = island?.totalLevels ?? ISLANDS.find(entry => entry.id === islandId)?.totalLevels ?? 0;
  return { completed, unlocked: island ? unlocked : [1], completedCount: completed.length, totalLevels,
    isCompleted: totalLevels > 0 && completed.length >= totalLevels, lastCompletedAt: island?.lastCompletedAt };
}
export function getLevelStatus(islandId, level) {
  const p = getIslandProgress(islandId);
  return p.completed.includes(level) ? "completed" : p.unlocked.includes(level) ? "unlocked" : "locked";
}
export function getOverallProgress() {
  const values = ISLANDS.map(i => getIslandProgress(i.id));
  const completedCases = values.reduce((sum,p)=>sum+p.completedCount,0);
  const totalCases = values.reduce((sum,p)=>sum+p.totalLevels,0);
  return { completedCases, totalCases, completedIslands: values.filter(p=>p.isCompleted).length, totalIslands: ISLANDS.length, percentage: Math.round(100*completedCases/totalCases) };
}
export function useProgression(islandId) {
  const read = () => islandId ? getIslandProgress(islandId) : getOverallProgress();
  const [progress,setProgress] = useState(read);
  useEffect(() => {
    const update = () => setProgress(read());
    update();
    refreshProgress().catch(() => {});
    window.addEventListener("codyssey:progress-changed",update);
    return () => window.removeEventListener("codyssey:progress-changed",update);
  },[islandId]);
  return progress;
}
