import { useCallback, useEffect, useRef, useState } from "react";
import { animated, useTransition } from "@react-spring/web";
import { submitFeedback, getFeedback } from "../api/client.js";
import BriefingPanel from "./BriefingPanel.jsx";
import ClassifiedText from "./ClassifiedText.jsx";
import ClickSpark from "./ClickSpark.jsx";

function Field({ label, textarea, ...props }) {
  const className =
    "mt-1.5 w-full bg-void border border-steel-light rounded-sm px-3 py-2.5 text-sm text-ink-primary placeholder:text-ink-faint focus:border-cyan-bright transition-colors font-body";
  return (
    <label className="block">
      <span className="font-mono text-[10px] tracking-widest uppercase text-ink-muted">
        {label}
      </span>
      {textarea ? (
        <textarea {...props} className={`${className} resize-none`} />
      ) : (
        <input {...props} className={className} />
      )}
    </label>
  );
}

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function FeedbackConsole() {
  const [form, setForm] = useState({ name: "", email: "", comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [entries, setEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const sparkRef = useRef(null);

  // New transmissions drop into the log; the first load trails in top to bottom
  const entryTransitions = useTransition(entries, {
    keys: (entry) => entry._id || entry.id,
    from: { opacity: 0, y: -10 },
    enter: { opacity: 1, y: 0 },
    leave: { opacity: 0, y: 0 },
    trail: 45,
    config: { tension: 260, friction: 24 },
  });

  const loadEntries = useCallback(() => {
    setLoadingEntries(true);
    setLoadError(null);
    getFeedback()
      .then((data) => setEntries(data.feedback || []))
      // Surface the failure instead of rendering it as an empty log
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoadingEntries(false));
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Mirror the backend's no-HTML rule so users get instant feedback instead of a round trip
    if (/[<>]/.test(form.name + form.comment)) {
      setSuccess(false);
      setError("Name and comment cannot contain < or > characters");
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      await submitFeedback(form);
      setForm({ name: "", email: "", comment: "" });
      setSuccess(true);
      sparkRef.current?.spark();
      loadEntries();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="access" className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28 scroll-mt-16">
      <div className="max-w-2xl mb-10">
        <p className="eyebrow mb-3">Briefing // 05</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-wide">
          <ClassifiedText text="Transmit Feedback" />
        </h2>
        <p className="mt-4 text-ink-muted leading-relaxed">
          Leave your name, contact frequency, and a message about this archive terminal.
          Submissions are logged below in the order received — no clearance badge required.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Submission form */}
        <div className="hud-panel hud-corners rounded-sm p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              label="Full Name"
              type="text"
              required
              minLength={2}
              maxLength={60}
              value={form.name}
              onChange={update("name")}
              placeholder="Jane Doe"
              autoComplete="name"
            />
            <Field
              label="Email"
              type="email"
              required
              maxLength={254}
              value={form.email}
              onChange={update("email")}
              placeholder="agent@example.com"
              autoComplete="email"
            />
            <Field
              label="Comment"
              textarea
              rows={4}
              required
              minLength={3}
              maxLength={1000}
              value={form.comment}
              onChange={update("comment")}
              placeholder="What did you think of the archive?"
            />
            <p className="-mt-2 text-right font-mono text-[10px] text-ink-faint">
              {form.comment.length}/1000
            </p>

            <div aria-live="polite">
              {error && (
                <p role="alert" className="font-mono text-xs text-redalert border border-redalert/40 bg-redalert/10 rounded-sm px-3 py-2">
                  TRANSMISSION FAILED — {error}
                </p>
              )}
              {success && (
                <p className="font-mono text-xs text-radar border border-radar/40 bg-radar/10 rounded-sm px-3 py-2">
                  TRANSMISSION RECEIVED — thank you for your feedback
                </p>
              )}
            </div>

            <ClickSpark
              ref={sparkRef}
              sparkColor={["#67e8f9", "#34d399"]}
              sparkCount={12}
              sparkRadius={34}
              shape="streak"
              glow={0.6}
              ring
              disabled={submitting}
            >
              <button
                type="submit"
                disabled={submitting}
                className="w-full font-mono text-xs tracking-widest uppercase bg-cyan-bright/15 border border-cyan-bright text-cyan-bright py-3 rounded-sm hover:bg-cyan-bright/25 transition-colors disabled:opacity-50"
              >
                {submitting ? "Transmitting..." : "> Submit Feedback"}
              </button>
            </ClickSpark>
          </form>
        </div>

        {/* Live transmission log */}
        <BriefingPanel eyebrow="Live Feed" title="Transmission Log" tag={loadError ? "OFFLINE" : `${entries.length} LOGGED`}>
          {loadingEntries ? (
            <p className="font-mono text-xs text-ink-muted animate-flicker">
              &gt; LOADING RECORDS...
            </p>
          ) : loadError ? (
            <div className="space-y-3">
              <p className="font-mono text-xs text-amber">&gt; FEED UNAVAILABLE — {loadError}</p>
              <button
                type="button"
                onClick={loadEntries}
                className="font-mono text-[11px] tracking-widest uppercase border border-steel-light text-ink-muted px-3 py-1.5 rounded-sm hover:text-cyan-bright hover:border-cyan-bright transition-colors"
              >
                Retry
              </button>
            </div>
          ) : entries.length === 0 ? (
            <p className="text-ink-muted text-sm">No transmissions logged yet — be the first.</p>
          ) : (
            <ul className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {entryTransitions(({ opacity, y }, entry) => (
                <animated.li
                  style={{ opacity, transform: y.to((v) => `translateY(${v}px)`) }}
                  className="border-l-2 border-steel-light pl-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-cyan-bright">{entry.name}</span>
                    <time
                      dateTime={entry.createdAt}
                      title={new Date(entry.createdAt).toLocaleString()}
                      className="font-mono text-[10px] text-ink-faint"
                    >
                      {timeAgo(entry.createdAt)}
                    </time>
                  </div>
                  <p className="mt-1 text-sm text-ink-muted leading-relaxed">{entry.comment}</p>
                </animated.li>
              ))}
            </ul>
          )}
        </BriefingPanel>
      </div>
    </section>
  );
}
