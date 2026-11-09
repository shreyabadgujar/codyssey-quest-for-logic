import { useEffect, useRef, useState } from "react";
import { useAuth } from "./useAuth.js";
import { getAchievements, getProfile } from "../services/gameService.js";

export function useAchievements() {
  const auth = useAuth();
  const latest = useRef(auth);
  latest.current = auth;
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const token = auth.token;
    setResult(null);
    setError("");
    getAchievements().then(async data => {
      if (!active) return;
      setResult(data);
      if (data.balance !== latest.current.user?.coins) {
        const profile = await getProfile().catch(() => null);
        if (active && profile && localStorage.getItem("codyssey_token") === token) latest.current.setUser(profile);
      }
    }).catch(failure => {
      if (active) setError(failure.message || "The achievement journal could not be loaded.");
    });
    return () => { active = false; };
  }, [auth.token, attempt]);

  return { result, error, retry: () => setAttempt(value => value + 1) };
}
