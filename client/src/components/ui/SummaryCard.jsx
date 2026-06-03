import GlassCard from "./GlassCard";

const SummaryCard = ({ title, value, icon: Icon }) => {
  return (
    <GlassCard>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">{value}</p>
        </div>
        {Icon ? (
          <span className="rounded-xl bg-indigo-600/10 p-3 text-indigo-700">
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </div>
    </GlassCard>
  );
};

export default SummaryCard;
