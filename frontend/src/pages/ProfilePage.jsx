import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../api/client';
import { Badge, Button, Card, Field, SectionHeader } from '../components/UI';
import { ROLE_LABELS } from '../utils/constants';
import { formatDateTime } from '../utils/format';

const emptyPassword = {
  currentPassword: '',
  newPassword: '',
};

export const ProfilePage = () => {
  const { user, setUser, refreshProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [passwordForm, setPasswordForm] = useState(emptyPassword);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const updateProfile = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    setMessage('');
    setError('');

    try {
      const response = await usersApi.update(user._id, { name: name.trim() });
      setUser(response.user);
      await refreshProfile();
      setMessage('Profile updated successfully.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setSavingPassword(true);
    setMessage('');
    setError('');

    try {
      await usersApi.changePassword(user._id, passwordForm);
      setPasswordForm(emptyPassword);
      setMessage('Password changed successfully.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Profile"
        title="Your account"
        description="Manage your identity details and security credentials from one account settings page."
      />

      {message ? <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">{message}</div> : null}
      {error ? <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="p-6">
          <div className="subtle-label">Identity</div>
          <h2 className="mt-2 text-xl font-semibold text-white">Profile details</h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Email</div>
              <div className="mt-2 text-sm font-semibold text-white">{user?.email}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Role</div>
              <div className="mt-2 text-sm font-semibold text-white">{ROLE_LABELS[user?.role] || user?.role}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Status</div>
              <div className="mt-2"><Badge tone={user?.isActive ? 'success' : 'danger'}>{user?.isActive ? 'Active' : 'Inactive'}</Badge></div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Last login</div>
              <div className="mt-2 text-sm font-semibold text-white">{formatDateTime(user?.lastLogin)}</div>
            </div>
          </div>

          <form className="mt-6 space-y-4" onSubmit={updateProfile}>
            <Field label="Display name">
              <input className="input" value={name} onChange={(event) => setName(event.target.value)} required />
            </Field>
            <Button type="submit" disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save profile'}
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <div className="subtle-label">Security</div>
          <h2 className="mt-2 text-xl font-semibold text-white">Change password</h2>
          <form className="mt-6 space-y-4" onSubmit={changePassword}>
            <Field label="Current password">
              <input
                className="input"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
                required
              />
            </Field>
            <Field label="New password" hint="8+ chars, uppercase, lowercase, and a number">
              <input
                className="input"
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
                required
              />
            </Field>
            <Button type="submit" disabled={savingPassword}>
              {savingPassword ? 'Updating...' : 'Change password'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};