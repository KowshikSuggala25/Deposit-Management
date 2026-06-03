const Modal = ({ isOpen, title, onClose, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/50 bg-white/80 p-6 shadow-xl backdrop-blur-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-200/60"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
