import React from "react";

export default function AuthForm({
  title,
  subtitle,
  form,
  onChange,
  onSubmit,
  loading,
  error,
  success,
  submitText,
  toggleText,
  toggleAction,
  backgroundVideo = "https://www.youtube.com/embed/KuDn-EWuZew?autoplay=1&mute=1&loop=1&playlist=KuDn-EWuZew&controls=0&showinfo=0&modestbranding=1",
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black text-white">
      {/* Background YouTube Video */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <iframe
          className="w-full h-full object-cover scale-125 opacity-40"
          src={backgroundVideo}
          title="Auth Background"
          frameBorder="0"
          allow="autoplay; muted; fullscreen"
          aria-hidden="true"
        ></iframe>
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

      {/* Form Container */}
      <div className="relative z-10 bg-slate-900/70 backdrop-blur-lg border border-slate-800 shadow-glow rounded-2xl p-8 w-[90%] max-w-md">
        <h1 className="text-3xl font-bold mb-4 text-center text-accent">{title}</h1>
        <p className="text-sm text-center text-gray-400 mb-6">{subtitle}</p>

        <form onSubmit={onSubmit} className="space-y-4">
          {Object.keys(form).map((key) => {
            const isPassword = key.toLowerCase().includes("password");
            const autoComplete =
              key.toLowerCase() === "email"
                ? "username"
                : isPassword
                ? "current-password"
                : "name";

            return (
              <div key={key}>
                <label htmlFor={key} className="block text-sm mb-1 capitalize">
                  {key.replace("_", " ")}
                </label>
                <input
                  id={key}
                  type={isPassword ? "password" : "text"}
                  name={key}
                  required
                  autoComplete={autoComplete}
                  value={form[key]}
                  onChange={onChange}
                  className="w-full px-3 py-2 rounded bg-slate-900/70 border border-slate-700 focus:outline-none focus:border-accent text-white transition"
                />
              </div>
            );
          })}

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-950/50 rounded p-2">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-400 text-sm text-center bg-green-950/50 rounded p-2">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 mt-2 rounded bg-accent text-black font-semibold hover:bg-blue-400 transition-all disabled:opacity-60"
          >
            {loading ? `${submitText}...` : submitText}
          </button>
        </form>

        {toggleText && toggleAction && (
          <p className="text-center text-sm text-gray-400 mt-4">
            {toggleText}{" "}
            <button
              type="button"
              onClick={toggleAction}
              className="text-accent hover:underline font-semibold"
            >
              {submitText === "Login" ? "Register" : "Login"}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
