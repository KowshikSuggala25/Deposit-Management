import { FiSearch } from "react-icons/fi";

const SearchInput = ({ value, onChange, placeholder }) => {
  return (
    <label className="relative block w-full">
      <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/50 bg-white/60 py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none backdrop-blur-md placeholder:text-slate-500 focus:border-indigo-500"
      />
    </label>
  );
};

export default SearchInput;
