import api from "./api.js";
// Never send rewards, XP, coins, or expected outputs from the client.
export const getIslands = () => api.get("/islands");
export const getIsland = (id) => api.get(`/islands/${id}`);
export const getMission = (id) => api.get(`/missions/${id}`);
export const getEditorial = (id) => api.get(`/missions/${id}/editorial`);
export const runCode = ({ missionId, language, code, input }) => api.post("/submissions/run", { missionId, language, code, ...(input !== undefined ? { input } : {}) });
export const submitCode = ({ missionId, language, code }) => api.post("/submissions", { missionId, language, code });
export const findObject = (missionId, position) => api.post(`/missions/${missionId}/find-object`, { position });
export const getShopItems = () => api.get("/shop/items");
export const purchaseItem = (itemId) => api.post("/shop/purchase", { itemId });
export const getAchievements = () => api.get("/achievements");
export const getProfile = () => api.get("/users/me");
export const getProfileJournal = () => api.get("/users/me", { params: { view: "journal" } });
export const equipAvatar = (base) => api.patch("/users/me/avatar", { base });
export const equipAvatarItem = (slot, itemId) => api.patch("/users/me/avatar", { slot, itemId });
