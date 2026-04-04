import { Link } from 'react-router-dom';
import { Badge, Card } from './UI';

export const AuthFrame = ({ title, subtitle, children, footerText, footerLink, footerLinkLabel }) => (
  <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-panel/90 p-8 shadow-soft lg:p-10">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(45,212,191,0.14),transparent_35%,rgba(251,191,36,0.10))]" />
        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal via-mint to-gold text-lg font-black text-slate-950 shadow-glow">
              F
            </div>
            <div>
              <div className="font-display text-xl font-bold text-white">FinFlow</div>
              <div className="text-sm text-slate-400">Backend-driven finance workspace</div>
            </div>
          </div>

          <div className="mt-12 max-w-xl">
            <Badge tone="success">Published API connected</Badge>
            <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-white md:text-6xl">
              Track cash flow with clarity and momentum.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-300 md:text-lg">
              {subtitle}
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <Card className="p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Live API</div>
              <div className="mt-3 text-lg font-semibold text-white">Secure JWT</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Access</div>
              <div className="mt-3 text-lg font-semibold text-white">RBAC roles</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Insights</div>
              <div className="mt-3 text-lg font-semibold text-white">Summary charts</div>
            </Card>
          </div>

          <div className="mt-10 flex items-center gap-4 text-sm text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.15)]" />
            Ready for admin, analyst, and viewer workflows.
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-soft backdrop-blur-xl sm:p-6">
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-6 sm:p-8">
            <div className="mb-8">
              <div className="subtle-label">FinFlow access</div>
              <h2 className="mt-3 font-display text-3xl font-bold text-white">{title}</h2>
            </div>
            {children}
            {footerText && footerLink ? (
              <div className="mt-8 text-sm text-slate-400">
                {footerText}{' '}
                <Link to={footerLink} className="font-semibold text-teal-200 transition hover:text-teal-100">
                  {footerLinkLabel}
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  </div>
);