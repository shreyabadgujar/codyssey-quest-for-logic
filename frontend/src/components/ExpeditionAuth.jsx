import { AlertCircle, ArrowLeft, Compass } from "lucide-react";
import { Link } from "react-router-dom";
import { getIslandArtwork } from "../data/islands.js";

export function ExpeditionAuth({ variant, title, introduction, error, children, alternate }) {
  const isNew = variant === "register";
  const island = isNew ? "array-archipelago" : "linked-isles";

  return (
    <div className="entry-auth" data-variant={variant}>
      <figure className="entry-auth-scene">
        <img src={getIslandArtwork(island).illustration} alt="" fetchPriority="high" />
        <figcaption>
          <Compass size={28} strokeWidth={1.2} aria-hidden="true" />
          <span className="entry-eyebrow">{isNew ? "The first crossing" : "The return passage"}</span>
          <strong>{isNew ? "Beyond the first shore" : "The way back to Ætheria"}</strong>
          <span className="entry-scene-credit">{isNew ? "Plate I · Array Archipelago" : "Plate III · Linked Isles"}</span>
        </figcaption>
      </figure>
      <section className="entry-dossier" aria-labelledby="entry-dossier-title">
        <Link to="/" className="entry-back"><ArrowLeft size={14} aria-hidden="true" /> Back to Codyssey</Link>
        <header className="entry-dossier-heading">
          <p className="entry-eyebrow">{isNew ? "New explorer registry" : "Expedition headquarters"}</p>
          <h1 id="entry-dossier-title">{title}</h1>
          <p>{introduction}</p>
        </header>
        {error && <div role="alert" className="entry-error"><AlertCircle size={18} aria-hidden="true" /><span>{error}</span></div>}
        {children}
        <p className="entry-auth-alternate">{alternate}</p>
      </section>
    </div>
  );
}
