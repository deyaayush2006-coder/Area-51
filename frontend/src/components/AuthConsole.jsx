import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import Dashboard from "./Dashboard.jsx";

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] tracking-widest uppercase text-ink-muted">
        {label}
      </span>
      <input
        {...props}
        className="mt-1.5 w-full bg-void border border-steel-light rounded-sm px-3 py-2.5 text-sm text-ink-primary placeholder:text-ink-faint focus:border-cyan-bright transition-colors font-body"
      />
    </label>
  );
}

export default function AuthConsole() {
  const { user, loading, error, clearError, login, register } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <section id="access" className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28">
        <p className="font-mono text-sm text-ink-muted animate-flicker">
          &gt; VERIFYING SESSION TOKEN...
        </p>
      </section>
    );
  }

  if (user) {
    return (
      <section id="access" className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28">
        <Dashboard />
      </section>
    );
  }

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const ok =
      mode === "login"
        ? await login({ email: form.email, password: form.password })
        : await register(form);
    setSubmitting(false);
    if (ok) setForm({ name: "", email: "", password: "" });
  };

  return (
    <section id="access" className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28">
      <div className="max-w-2xl mb-10">
        <p className="eyebrow mb-3">Briefing // 05</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-wide">
          Clearance Terminal
        </h2>
        <p className="mt-4 text-ink-muted leading-relaxed">
          Register a badge to access the archive terminal, or sign back in with existing
          credentials. Backend authentication is handled by the Express API — passwords are
          hashed, never stored in plain text.
        </p>
      </div>

      <div className="max-w-md">
        <div className="hud-panel hud-corners rounded-sm p-6 md:p-8">
          <div className="flex mb-6 border border-steel-light rounded-sm overflow-hidden font-mono text-xs tracking-widest uppercase">
            {["login", "register"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  clearError();
                }}
                className={`flex-1 py-2.5 transition-colors ${
                  mode === m
                    ? "bg-cyan-bright/15 text-cyan-bright"
                    : "text-ink-muted hover:text-ink-primary"
                }`}
              >
                {m === "login" ? "Sign In" : "New Badge"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <Field
                label="Full Name"
                type="text"
                required
                minLength={2}
                value={form.name}
                onChange={update("name")}
                placeholder="Jane Doe"
                autoComplete="name"
              />
            )}
            <Field
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={update("email")}
              placeholder="agent@example.com"
              autoComplete="email"
            />
            <Field
              label="Password"
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={update("password")}
              placeholder="••••••••"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />

            {error && (
              <p className="font-mono text-xs text-redalert border border-redalert/40 bg-redalert/10 rounded-sm px-3 py-2">
                ACCESS DENIED — {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full font-mono text-xs tracking-widest uppercase bg-cyan-bright/15 border border-cyan-bright text-cyan-bright py-3 rounded-sm hover:bg-cyan-bright/25 transition-colors disabled:opacity-50"
            >
              {submitting
                ? "Transmitting..."
                : mode === "login"
                ? "> Authenticate"
                : "> Submit Badge Request"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
