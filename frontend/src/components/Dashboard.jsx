import { useAuth } from "../context/AuthContext.jsx";
import BriefingPanel from "./BriefingPanel.jsx";

export default function Dashboard() {
  const { user, logout } = useAuth();

  const joined = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

  return (
    <div className="max-w-2xl">
      <div className="hud-panel hud-corners rounded-sm p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-2 h-2 rounded-full bg-radar animate-blip-pulse" />
          <span className="font-mono text-xs tracking-widest uppercase text-radar">
            Clearance Granted
          </span>
        </div>

        <p className="font-display text-2xl font-bold text-ink-primary">
          Welcome, {user?.name}.
        </p>
        <p className="mt-2 text-ink-muted text-sm leading-relaxed">
          Your credentials have been verified against the archive's directory. This session is
          authenticated with a signed token issued by the Express backend.
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-4 font-mono text-xs">
          <div>
            <dt className="text-ink-faint uppercase tracking-widest">Badge Email</dt>
            <dd className="text-ink-primary mt-1">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-ink-faint uppercase tracking-widest">Badge Issued</dt>
            <dd className="text-ink-primary mt-1">{joined}</dd>
          </div>
          <div>
            <dt className="text-ink-faint uppercase tracking-widest">Agent ID</dt>
            <dd className="text-ink-primary mt-1 truncate">{user?.id}</dd>
          </div>
          <div>
            <dt className="text-ink-faint uppercase tracking-widest">Status</dt>
            <dd className="text-radar mt-1">ACTIVE</dd>
          </div>
        </dl>

        <button
          onClick={logout}
          className="mt-8 font-mono text-xs tracking-widest uppercase border border-redalert/50 text-redalert px-4 py-2.5 rounded-sm hover:bg-redalert/10 transition-colors"
        >
          End Session
        </button>
      </div>

      <BriefingPanel className="mt-6" title="What's next?" tag="DEV NOTE">
        <p className="text-ink-muted text-sm leading-relaxed">
          This is where you'd build out the rest of the authenticated experience — e.g. the
          real archive content, an admin view, or user-specific data pulled from your own
          protected API routes.
        </p>
      </BriefingPanel>
    </div>
  );
}
