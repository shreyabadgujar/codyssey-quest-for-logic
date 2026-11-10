import { useEffect, useRef, useState } from "react";
import { useAuth } from "./useAuth.js";
import { getAchievements, getProfile } from "../services/gameService.js";

export function useAchievements({ live = false } = {}) {
  const auth = useAuth();
  const latest = useRef(auth);
  latest.current = auth;
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    let pending = false;
    let playerChanged = false;
    const token = auth.token;
    setResult(null);
    setError("");

    async function refresh() {
      if (pending || localStorage.getItem("codyssey_token") !== token) return;
      pending = true;
      try {
        const data = await getAchievements();
        if (!active) return;
        setResult(data);
        setError("");
        if (data.balance !== latest.current.user?.coins) {
          const profile = await getProfile().catch(() => null);
          if (active && profile && localStorage.getItem("codyssey_token") === token) latest.current.setUser(profile);
        }
      } catch (failure) {
        if (active) setError(failure.message || "The achievement journal could not be loaded.");
      } finally {
        pending = false;
        if (active && playerChanged) {
          playerChanged = false;
          refresh();
        }
      }
    }

    function refreshVisible() {
      if (document.visibilityState === "visible") refresh();
    }

    function refreshPlayer(event) {
      if (event.key !== "codyssey_user" || !event.newValue || localStorage.getItem("codyssey_token") !== token) return;
      try {
        const previous = JSON.parse(event.oldValue);
        const next = JSON.parse(event.newValue);
        if (next?._id === latest.current.user?._id && next?.achievements?.length !== previous?.achievements?.length) {
          if (pending) playerChanged = true;
          else refresh();
        }
      } catch {
        // The authenticated API remains the source of truth if cached data is malformed.
      }
    }

    refresh();
    if (live) {
      window.addEventListener("focus", refreshVisible);
      window.addEventListener("storage", refreshPlayer);
      document.addEventListener("visibilitychange", refreshVisible);
    }
    return () => {
      active = false;
      if (live) {
        window.removeEventListener("focus", refreshVisible);
        window.removeEventListener("storage", refreshPlayer);
        document.removeEventListener("visibilitychange", refreshVisible);
      }
    };
  }, [auth.token, attempt, live]);

  return { result, error, retry: () => setAttempt(value => value + 1) };
}
