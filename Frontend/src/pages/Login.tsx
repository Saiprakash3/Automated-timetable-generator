import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authApi } from "@/services/api/auth";
import { ApiError } from "@/services/api/client";
import { login } from "@/hooks/useSession";
import { ROLE_LABELS, ROLE_OPTIONS, type Role } from "@/types";
import { LANDING_ROUTE } from "@/lib/landingRoute";

// Canonical copy (COMPONENTS.md §G.3) — displayed by error CODE, not by
// whatever message string a given backend happens to send. The mock
// backend's own wording is close but not verbatim; the design system's
// copy is the source of truth regardless of which backend is behind it.
function errorMessageFor(err: ApiError, selectedRoleLabel: string): string {
  switch (err.code) {
    case "INVALID_CREDENTIALS":
      return "Incorrect ID/email or password.";
    case "ROLE_MISMATCH":
      return `This account isn't registered as ${selectedRoleLabel}. Check your role selection and try again.`;
    case "ACCOUNT_DISABLED":
      return "This account is inactive. Contact your administrator.";
    default:
      return err.message || "Something went wrong. Please try again.";
  }
}

export default function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>("admin");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);

  const canSubmit = identifier.trim() !== "" && password !== "" && !submitting;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const { access_token, refresh_token, user } = await authApi.login({ identifier: identifier.trim(), password, selectedRole: role });
      login(user, access_token, refresh_token);
      navigate(LANDING_ROUTE[user.role], { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError({ code: err.code, message: errorMessageFor(err, ROLE_LABELS[role]) });
      } else {
        setError({ code: "UNKNOWN_ERROR", message: "Something went wrong. Please try again." });
      }
    } finally {
      setSubmitting(false);
    }
  }

  const credentialsFlagged = error?.code === "INVALID_CREDENTIALS";
  const roleFlagged = error?.code === "ROLE_MISMATCH";

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4">
      {/* COMPONENTS.md §G.3 specifies 400px for this card — narrower than
          FOUNDATIONS.md §12's --container-sm (640px), which doesn't exist as
          a token here anyway. max-w-sm (384px) is the closest built-in
          Tailwind match; a 640px card would look stretched for 3 fields. */}
      <div className="w-full max-w-sm">
        {/* FOUNDATIONS §3.2: "Modals/drawers: --radius-lg (8px)" — overriding
            Card's own default rounded-xl (12px), which is for generic cards. */}
        <Card className="rounded-lg shadow-2">
          <CardContent className="space-y-6 p-8">
            <div className="space-y-1 text-center">
              <h1 className="text-h2 font-semibold font-heading text-foreground">Log In</h1>
              <p className="font-body text-sm text-muted-foreground">Enter your credentials to continue.</p>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>{error.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="identifier">ID or Email</Label>
                <Input
                  id="identifier"
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={submitting}
                  aria-invalid={credentialsFlagged}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Your role</Label>
                <Select value={role} onValueChange={(v) => setRole(v as Role)} disabled={submitting}>
                  <SelectTrigger id="role" className="w-full" aria-invalid={roleFlagged}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={submitting}
                    aria-invalid={credentialsFlagged}
                    className="pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center px-2.5 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={!canSubmit}>
                {submitting ? "Logging in…" : "Log In"}
              </Button>
            </form>

            <p className="text-center font-body text-sm text-muted-foreground">
              Trouble logging in? Contact your administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
