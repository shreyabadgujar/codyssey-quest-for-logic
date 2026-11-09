import { useLayoutEffect, useRef } from "react";
import { NavLink, Link } from "react-router-dom";
import { Map, Store, Award, User, Shirt, Compass, Radio } from "lucide-react";
import { useAuth } from "../hooks/useAuth.js";
import PlayerHeader from "./PlayerHeader.jsx";

const links = [
  { to: "/map", label: "World Map", Icon: Map },
  { to: "/dashboard", label: "Captain's Desk", Icon: Compass },
  { to: "/puzzles", label: "Puzzles", Icon: Radio },
  { to: "/avatar", label: "Avatar", Icon: Shirt },
  { to: "/shop", label: "Shop", Icon: Store },
  { to: "/achievements", label: "Achievements", Icon: Award },
  { to: "/profile", label: "Profile", Icon: User },
];

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const headerRef = useRef(null);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const updateHeight = () => root.style.setProperty("--navigation-height", `${headerRef.current.getBoundingClientRect().height}px`);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(headerRef.current);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--navigation-height");
    };
  }, []);

  return (
    <header ref={headerRef} className="paper sticky top-0 z-30 shadow-md" style={{ borderBottom: "3px double rgb(var(--c-ink))" }}>
      {/* Primary Navigation Bar */}
      <nav className="max-w-6xl mx-auto px-4 py-2.5 flex flex-wrap items-center gap-4" aria-label="Main">
        <Link to="/" className="font-display text-2xl text-ink no-underline mr-auto flex items-center gap-2">
          <img
            src="/assets/decorations/wax-seal.webp"
            alt=""
            width={24}
            height={24}
            className="w-6 h-6 object-contain drop-shadow"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          <span>Codyssey</span>
          <span className="annotation text-xs text-sepia hidden sm:inline">Quest for Logic</span>
        </Link>

        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            {links.map(({ to, label, Icon }) => (
              <NavLink
                key={to} aria-label={label}
                to={to}
                className={({ isActive }) =>
                  `inline-flex items-center gap-1 font-display text-sm no-underline transition-colors ${
                    isActive ? "text-ink border-b-2 border-brass font-bold" : "text-sepia hover:text-ink"
                  }`
                }
              >
                <Icon size={16} aria-hidden /> <span className="hidden md:inline">{label}</span>
              </NavLink>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost no-underline text-sm py-1.5 px-3">Log in</Link>
            <Link to="/register" className="btn-brass no-underline text-sm py-1.5 px-4">Begin Your Quest</Link>
          </div>
        )}
      </nav>

      {/* Authenticated Player Status Banner */}
      {isAuthenticated && <PlayerHeader />}
    </header>
  );
}
