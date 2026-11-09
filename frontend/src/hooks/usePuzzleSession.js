import { useEffect, useRef, useState } from "react";
import { openPuzzle, changePuzzle } from "../services/puzzleService.js";

export function usePuzzleSession(id, onAward) {
  const [row, setRow] = useState(null);
  const [draft, setDraft] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const ref = useRef(null);
  function publish(session, next) {
    session.row = next;
    if (ref.current !== session) return;
    setRow(next);
    if (session.pending === null && !session.writing) setDraft(next.draft);
  }
  function failure(session, err) {
    session.error = err;
    if (ref.current === session) setError(err);
  }
  function flush(session) {
    clearTimeout(session.timer);
    if (session.writing) return session.writing;
    if (session.error || session.pending === null) return Promise.resolve();
    session.writing = (async () => {
      while (session.pending !== null && !session.error) {
        const next = session.pending;
        session.pending = null;
        try {
          publish(session, await changePuzzle(session.id, "draft", session.row.revision, next));
        } catch (err) {
          session.pending ??= next;
          failure(session, err);
        }
      }
    })().finally(() => {
      session.writing = null;
      if (ref.current === session) setSaving(session.pending !== null);
    });
    return session.writing;
  }
  async function load(session) {
    session.locked = true;
    session.pending = null;
    session.error = null;
    setError(null);
    setBusy(true);
    setSaving(false);
    try {
      publish(session, await openPuzzle(session.id));
    } catch (err) {
      failure(session, err);
    } finally {
      session.locked = false;
      if (ref.current === session) setBusy(false);
    }
  }
  useEffect(() => {
    const session = { id, pending: null };
    ref.current = session;
    setRow(null);
    setDraft({});
    void load(session);
    return () => {
      if (ref.current === session) ref.current = null;
      void flush(session);
    };
  // The session lives for the route ID. A request from the old route cannot publish into the new one.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function edit(next, delayed = false) {
    const session = ref.current;
    if (!session?.row || session.locked || session.error) return;
    setDraft(next);
    setSaving(true);
    session.pending = next;
    clearTimeout(session.timer);
    if (delayed) session.timer = setTimeout(() => { void flush(session); }, 260);
    else void flush(session);
  }
  async function act(action) {
    const session = ref.current;
    if (!session?.row || session.locked || session.error) return;
    session.locked = true;
    setBusy(true);
    try {
      await flush(session);
      if (session.error) return;
      const next = await changePuzzle(id, action, session.row.revision);
      publish(session, next);
      if (next.awarded || next.alreadyRewarded) void onAward?.();
    } catch (err) {
      failure(session, err);
    } finally {
      session.locked = false;
      if (ref.current === session) setBusy(false);
    }
  }
  return { row, draft, error, busy, saving, edit, act,
    reload: () => { if (ref.current && !ref.current.locked) void load(ref.current); } };
}
