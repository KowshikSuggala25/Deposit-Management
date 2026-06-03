const DateRangeFilter = ({ range, onRangeChange, customStart, customEnd, onCustomChange }) => {
  const options = [
    { label: "All", value: "" },
    { label: "Today", value: "today" },
    { label: "This Week", value: "week" },
    { label: "This Month", value: "month" },
    { label: "Custom", value: "custom" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {options.map((option) => (
        <button
          key={option.value || "all"}
          type="button"
          onClick={() => onRangeChange(option.value)}
          className={`rounded-lg px-3 py-1.5 text-sm transition ${
            range === option.value
              ? "bg-indigo-600 text-white"
              : "bg-white/60 text-slate-700 hover:bg-white"
          }`}
        >
          {option.label}
        </button>
      ))}
      {range === "custom" ? (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={customStart}
            onChange={(event) => onCustomChange("start", event.target.value)}
            className="rounded-lg border border-white/50 bg-white/70 px-2 py-1.5 text-sm"
          />
          <input
            type="date"
            value={customEnd}
            onChange={(event) => onCustomChange("end", event.target.value)}
            className="rounded-lg border border-white/50 bg-white/70 px-2 py-1.5 text-sm"
          />
        </div>
      ) : null}
    </div>
  );
};

export default DateRangeFilter;
