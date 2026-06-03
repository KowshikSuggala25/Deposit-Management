import clsx from "clsx";

const GlassCard = ({ children, className = "", ...props }) => {
  return (
    <div
      {...props}
      className={clsx(
        "glass-card rounded-2xl border border-white/40 bg-white/25 p-5 shadow-[0_10px_30px_rgba(30,64,175,0.15)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(30,64,175,0.2)]",
        className
      )}
    >
      {children}
    </div>
  );
};

export default GlassCard;
