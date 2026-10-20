import { useEffect, useRef, useState } from "react";

const PASSCODE = "1818";

const LoginPage = ({ onSuccess }) => {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (event) => {
    const nextValue = event.target.value.replace(/\D/g, "").slice(0, PASSCODE.length);
    setPasscode(nextValue);
    setError("");

    if (nextValue.length === PASSCODE.length) {
      if (nextValue === PASSCODE) {
        sessionStorage.setItem("finance-authenticated", "true");
        onSuccess();
      } else {
        setPasscode("");
        setError("Incorrect passcode");
      }
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <section className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white/65 p-8 text-center shadow-2xl shadow-indigo-900/10 backdrop-blur-2xl sm:p-10">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-extrabold text-white shadow-lg shadow-indigo-600/25">
          ₹
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.28em] text-indigo-600">Finance Management</p>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Enter passcode</h1>
        <p className="mt-2 text-sm text-slate-500">Enter your four-digit passcode to continue</p>

        <div className="mt-8 flex justify-center gap-4" aria-hidden="true">
          {Array.from({ length: PASSCODE.length }, (_, index) => (
            <span
              key={index}
              className={`h-4 w-4 rounded-full border-2 transition-all ${
                passcode[index]
                  ? "scale-110 border-indigo-600 bg-indigo-600"
                  : "border-slate-300 bg-white/70"
              }`}
            />
          ))}
        </div>

        <label className="sr-only" htmlFor="finance-passcode">
          Four-digit passcode
        </label>
        <input
          ref={inputRef}
          id="finance-passcode"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          pattern="[0-9]*"
          maxLength={PASSCODE.length}
          value={passcode}
          onChange={handleChange}
          className="absolute h-px w-px opacity-0"
          aria-describedby={error ? "passcode-error" : undefined}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.focus()}
          className="mt-8 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Enter passcode
        </button>
        <p className={`mt-4 min-h-5 text-sm font-medium ${error ? "text-rose-600" : "text-transparent"}`} id="passcode-error">
          {error || " "}
        </p>
      </section>
    </main>
  );
};

export default LoginPage;
