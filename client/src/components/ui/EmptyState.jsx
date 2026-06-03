const EmptyState = ({ title, description }) => {
  return (
    <div className="rounded-2xl border border-dashed border-white/50 bg-white/40 p-8 text-center">
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </div>
  );
};

export default EmptyState;
