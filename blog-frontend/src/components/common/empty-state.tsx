import type { AriaRole, ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  icon: ReactNode;
  action?: ReactNode;
  role?: AriaRole;
};

export function EmptyState({
  title,
  description,
  icon,
  action,
  role = "status",
}: EmptyStateProps) {
  return (
    <div
      role={role}
      className="surface-soft grid place-items-center rounded-xl px-6 py-16 text-center"
    >
      <div className="grid max-w-md place-items-center gap-3">
        <div
          className="grid size-12 place-items-center rounded-lg bg-secondary text-secondary-foreground"
          aria-hidden="true"
        >
          {icon}
        </div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        {action ? <div className="pt-2">{action}</div> : null}
      </div>
    </div>
  );
}
