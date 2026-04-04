import { Link } from 'react-router-dom';

export const Card = ({ className = '', children }) => (
  <div className={`surface rounded-3xl ${className}`.trim()}>{children}</div>
);

export const Panel = ({ className = '', children }) => (
  <div className={`glass-panel rounded-3xl ${className}`.trim()}>{children}</div>
);

export const Button = ({ variant = 'primary', className = '', as: Component = 'button', ...props }) => {
  const base = 'focus:outline-none focus:ring-2 focus:ring-teal/30';
  const styles = {
    primary: 'button-primary',
    secondary: 'button-secondary',
    ghost: 'button-ghost',
  };

  if (Component === Link) {
    return <Link className={`${base} ${styles[variant]} ${className}`.trim()} {...props} />;
  }

  return <Component className={`${base} ${styles[variant]} ${className}`.trim()} {...props} />;
};

export const Badge = ({ tone = 'neutral', className = '', children }) => {
  const tones = {
    neutral: 'border-white/10 bg-white/5 text-slate-200',
    success: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
    warning: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
    danger: 'border-rose-400/20 bg-rose-400/10 text-rose-200',
    info: 'border-sky-400/20 bg-sky-400/10 text-sky-200',
  };

  return <span className={`chip ${tones[tone] || tones.neutral} ${className}`.trim()}>{children}</span>;
};

export const Field = ({ label, hint, children, className = '' }) => (
  <label className={`block space-y-2 ${className}`.trim()}>
    <div className="flex items-end justify-between gap-4">
      <span className="text-sm font-semibold text-slate-200">{label}</span>
      {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
    </div>
    {children}
  </label>
);

export const Spinner = ({ className = '' }) => (
  <div className={`flex items-center justify-center ${className}`.trim()}>
    <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-teal" />
  </div>
);

export const SectionHeader = ({ eyebrow, title, description, actions }) => (
  <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div className="max-w-2xl">
      {eyebrow ? <div className="subtle-label mb-2">{eyebrow}</div> : null}
      <h1 className="page-heading">{title}</h1>
      {description ? <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">{description}</p> : null}
    </div>
    {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
  </div>
);

export const MetricCard = ({ label, value, delta, icon, accent = 'from-teal/25 to-transparent', className = '' }) => (
  <Card className={`relative overflow-hidden p-5 ${className}`.trim()}>
    <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-60`} />
    <div className="relative flex items-start justify-between gap-4">
      <div>
        <div className="text-sm font-medium text-slate-400">{label}</div>
        <div className="mt-3 text-2xl font-bold text-white">{value}</div>
        {delta ? <div className="mt-2 text-xs font-semibold text-emerald-300">{delta}</div> : null}
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-100">{icon}</div>
    </div>
  </Card>
);

export const EmptyState = ({ title, description, action }) => (
  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 px-6 py-14 text-center">
    <div className="mb-4 rounded-3xl border border-teal/20 bg-teal/10 px-4 py-2 text-sm font-semibold text-teal-100">
      Nothing to show yet
    </div>
    <h3 className="text-lg font-semibold text-white">{title}</h3>
    {description ? <p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">{description}</p> : null}
    {action ? <div className="mt-6">{action}</div> : null}
  </div>
);