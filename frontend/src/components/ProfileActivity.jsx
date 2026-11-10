import { Link } from "react-router-dom";
import { ArrowUpRight, Award, BookOpen, Feather, Radio, ShoppingBag } from "lucide-react";
import { journalDate } from "../utils/journalDate.js";

const actions = {
  mission: { Icon: BookOpen, label: "Case solved" },
  achievement: { Icon: Award, label: "Honour unlocked" },
  puzzle: { Icon: Radio, label: "Artifact puzzle solved" },
  purchase: { Icon: ShoppingBag, label: "Purchase recorded" },
};

export function ProfileActivity({ activity }) {
  return (
    <section className="ec-sheet ec-activity" aria-labelledby="ec-activity-title">
      <div className="ec-section-heading">
        <div><p className="ec-kicker"><Feather size={17} aria-hidden="true" /> From the expedition journal</p><h2 id="ec-activity-title">Recent Entries</h2></div>
        <p className="ec-note">Latest first</p>
      </div>
      {activity.length ? <ol className="ec-timeline">
        {activity.map(event => {
          const { Icon, label } = actions[event.kind];
          return <li key={event.id} data-kind={event.kind}>
            <span className="ec-event-seal"><Icon size={18} aria-hidden="true" /></span>
            <div><p>{label}{event.kind === "puzzle" && event.coins > 0 ? ` · +${event.coins} coins` : ""}</p>
              <Link to={event.href}>{event.name} <ArrowUpRight size={13} aria-hidden="true" /></Link></div>
            <time dateTime={event.at}>{journalDate(event.at)}</time>
          </li>;
        })}
      </ol> : <p className="ec-empty">Your journal is ready for its first dated entry.</p>}
    </section>
  );
}
