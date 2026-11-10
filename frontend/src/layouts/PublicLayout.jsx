import { ArrowUpRight, Compass } from "lucide-react";
import { useLayoutEffect } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../hooks/useAuth.js";
import "../styles/expedition-entry.css";

export default function PublicLayout() {
  const { isAuthenticated } = useAuth();
  const { hash, key } = useLocation();

  useLayoutEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [hash, key]);

  return (
    <div className="entry-shell">
      {isAuthenticated ? <Navbar /> : <header className="entry-masthead">
        <nav className="entry-masthead-inner" aria-label="Main">
          <Link to="/" className="entry-brand" aria-label="Codyssey home">
            <Compass size={26} strokeWidth={1.35} aria-hidden="true" />
            <span>Codyssey <small>Quest for Logic</small></span>
          </Link>
          <div className="entry-nav">
            <NavLink to="/login">Sign In</NavLink>
            <NavLink to="/register" className="entry-nav-action">Sign Up <ArrowUpRight size={15} aria-hidden="true" /></NavLink>
          </div>
        </nav>
      </header>}
      <main className="entry-main"><Outlet /></main>
      <footer className="entry-footer">
        <Compass size={17} aria-hidden="true" />
        <span>Codyssey · Quest for Logic</span>
        <span>Charted in the Archipelago of Ætheria</span>
      </footer>
    </div>
  );
}
