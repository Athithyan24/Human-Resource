import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../services/api";
import { useAuth } from "../store/auth";
import { SceneLottie } from "../components/SceneLottie";
import { LOTTIE } from "../utils/format";
import { Button, Field, inputClass } from "../components/ui";

export function LoginPage() {
  const { register, handleSubmit, formState, setError } = useForm();
  const setSession = useAuth((s) => s.setSession);
  const user = useAuth((s) => s.user);
  const nav = useNavigate();
  if (user) return <Navigate to="/app" replace />;

  const onSubmit = async (values) => {
    try {
      const { data } = await api.post("/auth/login", values);
      setSession(data.token, data.user);
      nav("/app");
    } catch (e) {
      setError("root", { message: e.response?.data?.message || "Could not sign in" });
    }
  };

  return (
    <div className="paper-grid grid min-h-screen md:grid-cols-2">
      <div className="relative hidden overflow-hidden md:flex md:flex-col md:justify-between p-12">
        <p className="display text-3xl">Arclight</p>
        <div>
          <SceneLottie src={LOTTIE.office} className="h-72 w-72" />
          <h2 className="display mt-6 max-w-sm text-5xl leading-[1.05]">
            The people desk, kept quiet and exact.
          </h2>
          <p className="mt-4 max-w-sm text-sm text-ink/55">
            Lifecycle, attendance, and two-hour work logs — the same cadence a studio actually uses.
          </p>
        </div>
        <p className="text-xs text-ink/35">Harbor studio · PG demonstration build</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass hairline w-full max-w-md rounded-[24px] p-8"
        >
          <p className="text-[11px] uppercase tracking-[0.2em] text-copper">Sign in</p>
          <h1 className="display mt-2 text-4xl">Welcome back</h1>
          <div className="mt-8 space-y-4">
            <Field label="Username">
              <input className={inputClass} {...register("username", { required: true })} />
            </Field>
            <Field label="Password">
              <input type="password" className={inputClass} {...register("password", { required: true })} />
            </Field>
            {formState.errors.root && (
              <p className="text-sm text-copper">{formState.errors.root.message}</p>
            )}
            <Button className="w-full" disabled={formState.isSubmitting}>
              {formState.isSubmitting ? "Checking desk…" : "Enter studio"}
            </Button>
          </div>
          <div className="mt-8 space-y-1 text-xs text-ink/45">
            <p>Admin · harbor.admin / Harbor#2026</p>
            <p>Lead · ira.mehta / Leader#2026</p>
            <p>Employee · anika.shah / Employee#2026</p>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
