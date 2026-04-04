import { useEffect, useState } from 'react';
import { usersApi } from '../api/client';
import { Badge, Button, Card, EmptyState, Field, SectionHeader, Spinner } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS, ROLES } from '../utils/constants';
import { formatDateTime } from '../utils/format';

const emptyForm = {
  name: '',
  role: 'viewer',
  isActive: true,
};

export const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadUsers = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await usersApi.list('limit=50');
      setUsers(response.users || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const startEdit = (userRecord) => {
    setSelectedId(userRecord._id);
    setForm({
      name: userRecord.name || '',
      role: userRecord.role || 'viewer',
      isActive: Boolean(userRecord.isActive),
    });
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const submitUser = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        name: form.name.trim(),
        role: form.role,
        isActive: form.isActive,
      };

      await usersApi.update(selectedId, payload);
      setSelectedId(null);
      setForm(emptyForm);
      await loadUsers();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const deactivateUser = async (userRecord) => {
    const confirmed = window.confirm(`Deactivate ${userRecord.name}?`);
    if (!confirmed) return;

    setSaving(true);
    setError('');

    try {
      await usersApi.deactivate(userRecord._id);
      await loadUsers();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setSelectedId(null);
    setForm(emptyForm);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Administration"
        title="Users"
        description="Manage platform access, activation state, and profile details for the FinFlow user base."
      />

      {error ? (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="subtle-label">Directory</div>
              <h2 className="mt-2 text-xl font-semibold text-white">All users</h2>
            </div>
            <Badge tone="info">Admin only</Badge>
          </div>

          {loading ? <Spinner className="min-h-[300px]" /> : null}

          {!loading && !users.length ? (
            <div className="mt-6">
              <EmptyState title="No users found" description="Seed the database or register a new user to populate this table." />
            </div>
          ) : null}

          {!loading && users.length ? (
            <div className="mt-6 overflow-x-auto rounded-[1.25rem] border border-white/10">
              <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                <thead className="bg-white/5 text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Last login</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-slate-950/20">
                  {users.map((userRecord) => (
                    <tr key={userRecord._id} className="text-slate-300">
                      <td className="px-4 py-3 font-semibold text-white">{userRecord.name}</td>
                      <td className="px-4 py-3">{userRecord.email}</td>
                      <td className="px-4 py-3">
                        <Badge tone="neutral">{ROLE_LABELS[userRecord.role] || userRecord.role}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={userRecord.isActive ? 'success' : 'danger'}>
                          {userRecord.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">{formatDateTime(userRecord.lastLogin || userRecord.updatedAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Button variant="secondary" onClick={() => startEdit(userRecord)}>
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            disabled={userRecord._id === currentUser?._id || !userRecord.isActive || saving}
                            onClick={() => deactivateUser(userRecord)}
                          >
                            Deactivate
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </Card>

        <Card className="p-6">
          <div className="subtle-label">Editor</div>
          <h2 className="mt-2 text-xl font-semibold text-white">{selectedId ? 'Update user' : 'Select a user'}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Edit role, activation state, or name. Non-admin rules are enforced by the backend, so this panel keeps the same form contract.
          </p>

          {selectedId ? (
            <form className="mt-6 space-y-4" onSubmit={submitUser}>
              <Field label="Name">
                <input className="input" name="name" value={form.name} onChange={handleChange} required />
              </Field>
              <Field label="Role">
                <select className="select" name="role" value={form.role} onChange={handleChange}>
                  {Object.values(ROLES).map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </Field>
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
                Account active
              </label>
              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save changes'}
                </Button>
                <Button type="button" variant="secondary" onClick={cancelEdit}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/5 px-5 py-8 text-sm text-slate-400">
              Select a user from the table to edit their profile and role.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};