import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthFrame } from '../components/AuthFrame';
import { Button, Field } from '../components/UI';
import { ROLES } from '../utils/constants';
import { useAuth } from '../context/AuthContext';

const initialForm = {
  name: '',
  email: '',
  password: '',
  role: 'viewer',
};

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, clearAuthError } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    clearAuthError();

    try {
      const response = await register(form);
      const role = response?.user?.role;
      navigate(role === 'viewer' ? '/app/transactions' : '/app/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFrame
      title="Create your FinFlow account"
      subtitle="Register a new user profile and choose the role that matches the level of access you want to test or operate with."
      footerText="Already have an account?"
      footerLink="/login"
      footerLinkLabel="Sign in"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <Field label="Full name">
          <input
            className="input"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Jane Doe"
            autoComplete="name"
            required
          />
        </Field>
        <Field label="Email">
          <input
            className="input"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </Field>
        <Field label="Password" hint="Use at least 8 characters with upper/lowercase letters and a number">
          <input
            className="input"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Create a secure password"
            autoComplete="new-password"
            required
          />
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

        {error ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>
    </AuthFrame>
  );
};