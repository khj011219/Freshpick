import { getExpirationStatus, getDayLabel, ExpirationStatus } from "@/utils/expiration";

type StatusBadgeProps = {
  expiryDate: string;
};

const badgeStyles: Record<ExpirationStatus, string> = {
  expired: "bg-danger-50 text-danger-500",
  urgent:  "bg-danger-50 text-danger-500",
  warning: "bg-warning-50 text-warning-500",
  safe:    "bg-brand-50 text-brand-600",
};

export const StatusBadge = ({ expiryDate }: StatusBadgeProps) => {
  const status = getExpirationStatus(expiryDate);
  const label  = getDayLabel(expiryDate);

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${badgeStyles[status]}`}
    >
      {label}
    </span>
  );
};
