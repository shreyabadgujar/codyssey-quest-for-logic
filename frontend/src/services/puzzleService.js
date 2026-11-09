import api from "./api.js";
export const listPuzzles = () => api.get("/puzzles");
export const openPuzzle = id => api.get("/puzzles/" + id);
export const changePuzzle = (id, action, revision, draft) =>
  api.post("/puzzles/" + id + "/" + action, action === "draft" ? { revision, draft } : { revision });
