import { Link } from "react-router-dom";
import { Award, BookOpen, ShoppingBag } from "lucide-react";
import { journalDate } from "../utils/journalDate.js";

const actions = {
  mission: { Icon: BookOpen, label: "Case solved" },
  achievement: { Icon: Award, label: "Honour unlocked" },
  purchase: { Icon: ShoppingBag, label: "Purchase recorded" },
};

export function ProfileActivity({ activity }) {
  return (
    <section className="folio space-y-3">
      <h2 className="text-2xl">Recent entries</h2>
      {activity.length ? <ol className="divide-y divide-ink/15">
        {activity.map(event => {
          const { Icon, label } = actions[event.kind];
          return <li key={event.id} className="flex items-start gap-3 py-2">
            <Icon className="mt-1 shrink-0 text-brass" size={18} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="annotation text-xs">{label}</p>
              <Link className="font-display underline-offset-4 hover:underline" to={event.href}>{event.name}</Link>
            </div>
            <time className="annotation shrink-0 text-xs" dateTime={event.at}>{journalDate(event.at)}</time>
          </li>;
        })}
      </ol> : <p>Your journal is ready for its first dated entry.</p>}
    </section>
  );
}
