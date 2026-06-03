import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/30 p-10 text-center shadow-lg backdrop-blur-xl">
      <h1 className="text-4xl font-black text-slate-900">404</h1>
      <p className="mt-2 text-slate-600">The page you are looking for does not exist.</p>
      <Link
        to="/"
        className="mt-6 inline-flex rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
      >
        Go to Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;
