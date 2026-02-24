type TabButtonProps = {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
};

export const TabButton = ({ active, onClick, icon: Icon, label }: TabButtonProps) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center py-2 px-4 transition-colors ${
      active ? 'text-brand-600' : 'text-slate-400'
    }`}
  >
    <Icon size={24} strokeWidth={active ? 2.5 : 2} />
    <span className="text-[10px] mt-1 font-medium uppercase tracking-wider">{label}</span>
  </button>
);
