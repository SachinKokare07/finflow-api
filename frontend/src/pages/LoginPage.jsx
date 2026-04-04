import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthFrame } from '../components/AuthFrame';
import { Button, Field } from '../components/UI';
import { useAuth } from '../context/AuthContext';

const initialForm = {
  email: 'admin@finflow.com',
  password: 'Admin@1234',
};

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, clearAuthError } = useAuth();
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
      const response = await login(form);
      const role = response?.user?.role;
      const destination = role === 'admin' || role === 'analyst' ? '/app/dashboard' : '/app/transactions';
      navigate(location.state?.from?.pathname || destination, { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFrame
      title="Sign in to FinFlow"
      subtitle="Access the live dashboard, review transactions, and manage users through a single polished interface connected to the deployed backend."
      footerText="Need an account?"
      footerLink="/register"
      footerLinkLabel="Create one"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
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
        <Field label="Password">
          <input
            className="input"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />
        </Field>

        {error ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
        Demo accounts seeded in the backend: admin@finflow.com, analyst@finflow.com, viewer@finflow.com.
      </div>
    </AuthFrame>
  );
};