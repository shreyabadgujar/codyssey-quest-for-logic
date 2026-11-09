import { motion } from "motion/react";
import CoinDisplay from "./CoinDisplay.jsx";

// Displays rewards returned by the server. It never computes them.
export default function RewardModal({ open, rewards, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgb(var(--c-ink) / 0.6)" }}
      role="dialog" aria-modal="true" aria-label="Rewards">
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="folio max-w-sm w-full">
        <h2 className="text-2xl">Case closed</h2>
        <p>+{rewards?.xp ?? 0} XP</p>
        <CoinDisplay coins={rewards?.coins ?? 0} />
        <div className="mt-4"><button className="btn-brass" onClick={onClose}>Continue</button></div>
      </motion.div>
    </div>
  );
}
