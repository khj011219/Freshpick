type StatusBadgeProps = {
  expiryDate: string;
};

export const StatusBadge = ({ expiryDate }: StatusBadgeProps) => {
  const diff = Math.ceil(
    (new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diff < 0)
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-danger-50 text-danger-500 uppercase">
        Expired
      </span>
    );

  if (diff <= 3)
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-warning-50 text-warning-500 uppercase">
        {diff === 0 ? 'Today' : `${diff} days left`}
      </span>
    );

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-600 uppercase">
      Safe
    </span>
  );
};
