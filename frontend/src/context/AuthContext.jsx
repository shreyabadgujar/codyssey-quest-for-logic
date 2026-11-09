import { createContext, useState, useMemo, useEffect, useRef } from "react";
import { getMe } from "../services/authService.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("codyssey_token"));
  const [profileError, setProfileError] = useState(false);
  const profileVersion = useRef(0);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("codyssey_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    let active = true;
    const version = profileVersion.current;
    if (token) {
      getMe()
        .then((fetchedUser) => {
          if (active && version === profileVersion.current && fetchedUser) {
            setUser(fetchedUser);
            localStorage.setItem("codyssey_user", JSON.stringify(fetchedUser));
          }
        })
        .catch(() => {
          if (active && version === profileVersion.current) setProfileError(true);
        });
    }
    return () => { active = false; };
  }, [token]);

  const value = useMemo(() => ({
    user,
    token,
    profileError,
    setUser: (updatedUser) => {
      profileVersion.current++;
      setProfileError(false);
      setUser(updatedUser);
      if (updatedUser) {
        localStorage.setItem("codyssey_user", JSON.stringify(updatedUser));
      } else {
        localStorage.removeItem("codyssey_user");
      }
    },
    isAuthenticated: Boolean(token),
    setSession: (nextToken, nextUser) => {
      profileVersion.current++;
      setProfileError(false);
      localStorage.setItem("codyssey_token", nextToken);
      if (nextUser) {
        localStorage.setItem("codyssey_user", JSON.stringify(nextUser));
      }
      setToken(nextToken);
      setUser(nextUser || null);
    },
    logout: () => {
      profileVersion.current++;
      setProfileError(false);
      localStorage.removeItem("codyssey_token");
      localStorage.removeItem("codyssey_user");
      setToken(null);
      setUser(null);
    },
  }), [user, token, profileError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

