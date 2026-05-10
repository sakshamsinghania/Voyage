import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

type Mode = "signin" | "signup";

export function Auth() {
  const { signIn, signUp, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/";

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<"email" | "password" | "form" | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "authed") navigate(redirectTo, { replace: true });
  }, [status, navigate, redirectTo]);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const switchMode = () => {
    setMode((m) => (m === "signin" ? "signup" : "signin"));
    setError(null);
    setErrorField(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setError(null);
    setErrorField(null);

    if (!email.trim()) {
      setError("Email required");
      setErrorField("email");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setErrorField("password");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "signin") await signIn(email.trim(), password);
      else await signUp(email.trim(), password);
    } catch (err) {
      setError((err as Error).message);
      setErrorField("form");
      setSubmitting(false);
    }
  };

  const heading = mode === "signin" ? "Sign in" : "Create account";
  const toggleLabel =
    mode === "signin" ? "New here? Create account →" : "Have account? Sign in →";

  return (
    <div className="min-h-full flex flex-col bg-ground text-loud">
      <header className="px-8 lg:px-12 pt-8 flex items-center">
        <span className="font-mono text-title font-semibold tracking-tight flex items-baseline gap-1.5">
          <span className="inline-block w-2.5 h-2.5 bg-amber translate-y-[1px]" aria-hidden />
          <span>voyage</span>
        </span>
      </header>

      <main className="flex-1 px-8 lg:px-12 flex">
        <div className="w-full max-w-[360px] mt-[18vh] ml-0 md:ml-[8vw]">
          <div key={mode} className="auth-mode-fade">
            <h1 className="font-sans text-head font-semibold tracking-tight mb-1">
              {heading}
            </h1>
            <p className="meta mb-10">
              {mode === "signin"
                ? "Resume your research thread."
                : "Start a research workspace."}
            </p>

            <form onSubmit={onSubmit} noValidate className="space-y-7">
              <Field
                id="email"
                label="Email"
                type="email"
                autoComplete={mode === "signin" ? "username" : "email"}
                value={email}
                onChange={setEmail}
                error={errorField === "email" ? error : null}
                inputRef={emailRef}
                disabled={submitting}
              />
              <Field
                id="password"
                label="Password"
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={setPassword}
                error={errorField === "password" ? error : null}
                disabled={submitting}
                hint={mode === "signup" ? "Min 8 characters." : undefined}
              />

              {errorField === "form" && error && (
                <div className="font-mono text-meta text-amber-dim -mt-3" role="alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="group relative w-full h-11 px-4 flex items-center justify-between bg-amber text-void font-mono text-meta uppercase tracking-wider font-medium transition-colors duration-120 hover:bg-amber-dim disabled:bg-amber-deep disabled:text-quiet disabled:cursor-not-allowed"
              >
                <span>{submitting ? "…" : "Continue"}</span>
                <span className="font-mono text-meta opacity-80 group-hover:translate-x-0.5 transition-transform duration-120">
                  ↵
                </span>
              </button>
            </form>

            <div className="mt-8 flex items-center justify-between border-t border-rim pt-5">
              <button
                type="button"
                onClick={switchMode}
                className="label text-quiet hover:text-loud transition-colors duration-120"
              >
                {toggleLabel}
              </button>
              {mode === "signin" && (
                <span className="label text-rim" title="Coming soon">
                  Forgot?
                </span>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="px-8 lg:px-12 pb-6 flex items-center gap-3">
        <span className="inline-block w-1 h-1 rounded-full bg-amber" aria-hidden />
        <span className="label">auth · v0.1 · render.com</span>
      </footer>

      <style>{`
        .auth-mode-fade {
          animation: auth-fade 200ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes auth-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

interface FieldProps {
  id: string;
  label: string;
  type: string;
  autoComplete?: string;
  value: string;
  onChange: (v: string) => void;
  error: string | null;
  hint?: string;
  disabled?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
}

function Field({
  id,
  label,
  type,
  autoComplete,
  value,
  onChange,
  error,
  hint,
  disabled,
  inputRef,
}: FieldProps) {
  const errored = !!error;
  return (
    <div>
      <label htmlFor={id} className="label block mb-2">
        {label}
      </label>
      <input
        id={id}
        ref={inputRef}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-invalid={errored || undefined}
        aria-describedby={errored ? `${id}-err` : hint ? `${id}-hint` : undefined}
        className={`w-full bg-transparent border-b ${
          errored ? "border-amber-dim" : "border-rim"
        } focus:border-amber outline-none focus:outline-none focus-visible:outline-none px-0 py-2 font-mono text-body text-loud placeholder:text-quiet caret-amber transition-colors duration-120 disabled:opacity-50`}
        style={{ borderRadius: 0 }}
      />
      {errored && (
        <div id={`${id}-err`} className="font-mono text-meta text-amber-dim mt-1.5">
          {error}
        </div>
      )}
      {!errored && hint && (
        <div id={`${id}-hint`} className="font-mono text-meta text-quiet mt-1.5">
          {hint}
        </div>
      )}
    </div>
  );
}
