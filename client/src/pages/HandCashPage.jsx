import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiSun } from "react-icons/fi";
import { BiRupee } from "react-icons/bi";

const HandCashPage = () => {
  const navigate = useNavigate();
  return (
    <section className="space-y-6">
      <button type="button" onClick={() => navigate("/")} className="inline-flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-sm text-slate-700 hover:bg-white"><FiArrowLeft /> Finance Management</button>
      <header className="glass-card rounded-2xl border border-white/50 bg-white/30 p-6 backdrop-blur-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Hand Cash</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Choose a finance category</h1>
        <p className="mt-2 text-slate-600">Rates are recorded in rupees per ₹100 for the selected month or year.</p>
      </header>
      <div className="grid gap-5 sm:grid-cols-2">
        {[["gold", "Gold Finance", "Track customers and gold-backed cash finance.", FiSun], ["cash", "Cash Finance", "Track customers and direct cash finance.", BiRupee]].map(([category, title, description, Icon]) => (
          <button key={category} type="button" onClick={() => navigate(`/hand-cash/${category}`)} className="rounded-2xl border border-white/60 bg-white/60 p-7 text-left shadow-lg transition hover:-translate-y-1 hover:bg-white">
            <Icon className="text-3xl text-amber-600" /><h2 className="mt-4 text-2xl font-bold text-slate-900">{title}</h2><p className="mt-2 text-slate-600">{description}</p><span className="mt-5 inline-flex items-center gap-2 font-semibold text-indigo-700">Open dashboard <FiArrowRight /></span>
          </button>
        ))}
      </div>
    </section>
  );
};
export default HandCashPage;
