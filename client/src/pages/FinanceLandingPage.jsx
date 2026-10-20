import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiBriefcase } from "react-icons/fi";
import { BiRupee } from "react-icons/bi";

const FinanceLandingPage = () => {
  const navigate = useNavigate();
  const options = [
    { title: "Banks", description: "Manage bank accounts, customers, and deposits.", icon: FiBriefcase, path: "/banks" },
    { title: "Hand Cash", description: "Manage gold finance and cash finance records.", icon: BiRupee, path: "/hand-cash" },
  ];
  return (
    <section className="flex min-h-[75vh] flex-col items-center justify-center py-8">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-600">Finance Management</p>
      <h1 className="mt-3 text-center text-4xl font-extrabold text-slate-900 sm:text-5xl">Choose a finance desk</h1>
      <p className="mt-3 max-w-xl text-center text-slate-600">Every Rupee Tells a Story - Sai Kowshik Suggala❤️</p>
      <div className="mt-10 grid w-full max-w-3xl gap-6 sm:grid-cols-2">
        {options.map(({ title, description, icon: Icon, path }) => (
          <button key={title} type="button" onClick={() => navigate(path)}
            className="group rounded-3xl border border-white/70 bg-white/60 p-8 text-left shadow-xl backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white">
            <span className="inline-flex rounded-2xl bg-indigo-100 p-4 text-3xl text-indigo-700"><Icon /></span>
            <h2 className="mt-6 text-2xl font-bold text-slate-900">{title}</h2>
            <p className="mt-2 text-slate-600">{description}</p>
            <span className="mt-6 inline-flex items-center gap-2 font-semibold text-indigo-700">Open {title} <FiArrowRight className="transition group-hover:translate-x-1" /></span>
          </button>
        ))}
      </div>
    </section>
  );
};
export default FinanceLandingPage;
