import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Badge, Button, Card } from './UI';
import { NAV_ITEMS, ROLE_LABELS } from '../utils/constants';

const navClass = ({ isActive }) =>
  `flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
    isActive
      ? 'bg-gradient-to-r from-teal/20 to-gold/10 text-white ring-1 ring-teal/30'
      : 'text-slate-300 hover:bg-white/5 hover:text-white'
  }`;

export const AppShell = () => {
  const { user, role, logout } = useAuth();
  const navItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="border-b border-white/10 bg-panel/95 px-4 py-4 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
        <div className="flex items-center justify-between lg:block">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal via-mint to-gold text-lg font-black text-slate-950 shadow-glow">
              F
            </div>
            <div>
              <div className="font-display text-xl font-bold text-white">FinFlow</div>
              <div className="text-xs text-slate-400">Finance control center</div>
            </div>
          </div>
          <Button variant="ghost" onClick={logout} className="lg:hidden">
            Logout
          </Button>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Signed in as</div>
          <div className="mt-2 text-lg font-semibold text-white">{user?.name || 'Member'}</div>
          <div className="mt-1 text-sm text-slate-400">{user?.email}</div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone="info">{ROLE_LABELS[role] || role}</Badge>
            <Badge tone={user?.isActive ? 'success' : 'danger'}>
              {user?.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>

        <nav className="mt-6 space-y-2">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navClass}>
              <span>{item.label}</span>
              <span className="text-xs text-slate-500">{item.roles.length === 1 ? 'Locked' : ''}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 hidden lg:block">
          <Button variant="secondary" onClick={logout} className="w-full">
            Sign out
          </Button>
        </div>
      </aside>

      <main className="relative overflow-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.10),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl space-y-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};