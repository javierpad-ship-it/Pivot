"use client";

import { useState, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      let data: { error?: string; redirectTo?: string } = {};
      try {
        data = await res.json();
      } catch {
        setError(`Error del servidor (${res.status}). Revisa los logs.`);
        return;
      }

      if (!res.ok) {
        setError(data.error ?? "Error al iniciar sesión");
        return;
      }

      const destination = next && next.startsWith("/") ? next : data.redirectTo ?? "/";
      window.location.href = destination;
    } catch {
      setError("Error de red. Verifica tu conexión e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #050a14 0%, #0a1628 50%, #050a14 100%)" }}
    >
      {/* Glow blobs */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[120px] opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgb(0,140,255) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full blur-[100px] opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgb(0,140,255) 0%, transparent 70%)" }}
      />

      <div className="max-w-sm w-full relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          {/* Logo sobre píldora blanca para contraste */}
          <div className="inline-flex items-center justify-center bg-white rounded-2xl px-8 py-4 mb-5 shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://rematefabrica.vteximg.com.br/arquivos/logo325x117.png?v=638617958543700000"
              alt="Lukers"
              className="h-9 object-contain"
            />
          </div>

          <p
            className="text-xs font-medium tracking-[0.2em] uppercase mb-5"
            style={{ color: "rgb(0,140,255)" }}
          >
            Mejores Marcas • Mejores Precios
          </p>

          <h2 className="text-2xl font-bold tracking-tight text-white">
            Pivot<span style={{ color: "rgb(0,140,255)" }}>Store</span>
          </h2>
          <p className="text-sm mt-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>
            Ingresa tus credenciales para continuar
          </p>
        </div>

        {/* Card glassmorphism */}
        <div
          className="rounded-2xl p-6 space-y-5"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 0 40px rgba(0,140,255,0.08), 0 25px 50px rgba(0,0,0,0.4)",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Usuario
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.trim().toLowerCase())}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(0,140,255,0.6)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,140,255,0.12)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(255,255,255,0.10)";
                  e.currentTarget.style.boxShadow = "none";
                }}
                placeholder="tu.usuario"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-11 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.10)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = "1px solid rgba(0,140,255,0.6)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,140,255,0.12)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = "1px solid rgba(255,255,255,0.10)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 transition-opacity"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)" }}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "rgb(248,113,113)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm" style={{ color: "rgb(248,113,113)" }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full font-semibold py-2.5 px-4 rounded-xl text-sm text-white transition-all disabled:opacity-50"
              style={{
                background: loading ? "rgba(0,140,255,0.6)" : "rgb(0,140,255)",
                boxShadow: loading ? "none" : "0 0 20px rgba(0,140,255,0.35), 0 4px 15px rgba(0,140,255,0.2)",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = "rgb(0,120,220)";
                  e.currentTarget.style.boxShadow = "0 0 30px rgba(0,140,255,0.5), 0 4px 20px rgba(0,140,255,0.3)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = "rgb(0,140,255)";
                  e.currentTarget.style.boxShadow = "0 0 20px rgba(0,140,255,0.35), 0 4px 15px rgba(0,140,255,0.2)";
                }
              }}
            >
              {loading ? "Ingresando…" : "Ingresar"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
