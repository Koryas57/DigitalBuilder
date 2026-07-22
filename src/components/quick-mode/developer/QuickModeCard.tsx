import React from "react";

interface QuickModeCardProps {
  className?: string;
  icon?: React.ReactNode;
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
}

export const QuickModeCard: React.FC<QuickModeCardProps> = ({
  className = "",
  icon,
  title,
  actionLabel,
  onAction,
  children,
}) => (
  <article className={`quick-card ${className}`.trim()}>
    <header className="quick-card__header">
      <div>
        {icon && <span className="quick-card__icon">{icon}</span>}
        <h2>{title}</h2>
      </div>
      {actionLabel && (
        <button type="button" onClick={onAction} className="quick-card__action">
          {actionLabel}
        </button>
      )}
    </header>
    {children}
  </article>
);
