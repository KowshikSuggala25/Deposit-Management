const LoadingState = ({ label = "Loading" }) => {
  return (
    <div className="flex min-h-32 items-center justify-center">
      <div className="flex items-center gap-3 rounded-xl bg-white/60 px-4 py-3 text-sm font-medium text-slate-700 backdrop-blur-md">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-r-transparent" />
        {label}
      </div>
    </div>
  );
};

export default LoadingState;
