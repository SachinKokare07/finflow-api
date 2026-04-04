import { useEffect, useMemo, useState } from 'react';
import { transactionsApi } from '../api/client';
import { Badge, Button, Card, EmptyState, Field, SectionHeader, Spinner } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, TRANSACTION_TYPES, TRANSACTION_TYPE_LABELS } from '../utils/constants';
import { formatCurrency, formatDate, toQueryString } from '../utils/format';

const emptyForm = {
  amount: '',
  type: 'income',
  category: 'salary',
  date: new Date().toISOString().slice(0, 10),
  description: '',
};

const emptyFilters = {
  search: '',
  type: '',
  category: '',
  startDate: '',
  endDate: '',
  minAmount: '',
  maxAmount: '',
  sortBy: 'date',
  sortOrder: 'desc',
};

export const TransactionsPage = () => {
  const { role } = useAuth();
  const canManage = role === 'analyst' || role === 'admin';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const query = useMemo(
    () =>
      toQueryString({
        page,
        limit: 10,
        ...appliedFilters,
      }),
    [page, appliedFilters]
  );

  const loadTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await transactionsApi.list(query);
      setTransactions(response.transactions || []);
      setPagination(response.pagination || null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [query]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const applyFilters = (event) => {
    event.preventDefault();
    setPage(1);
    setAppliedFilters(filters);
  };

  const clearFilters = () => {
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setPage(1);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const startEdit = (transaction) => {
    setEditingId(transaction._id);
    setForm({
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      date: transaction.date ? transaction.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
      description: transaction.description || '',
    });
  };

  const submitTransaction = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
        description: form.description.trim(),
      };

      if (editingId) {
        await transactionsApi.update(editingId, payload);
      } else {
        await transactionsApi.create(payload);
      }

      resetForm();
      await loadTransactions();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const removeTransaction = async (transaction) => {
    const confirmed = window.confirm(`Delete ${transaction.category} transaction worth ${formatCurrency(transaction.amount)}?`);
    if (!confirmed) return;

    setSaving(true);
    setError('');

    try {
      await transactionsApi.remove(transaction._id);
      await loadTransactions();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Records"
        title="Transactions"
        description="Search, filter, create, update, and soft-delete transaction records through the live backend."
        actions={[
          <Badge key="scope" tone="neutral">
            {canManage ? 'Create enabled' : 'Read-only access'}
          </Badge>,
        ]}
      />

      <Card className="p-5">
        <form className="grid gap-4 lg:grid-cols-6" onSubmit={applyFilters}>
          <div className="lg:col-span-2">
            <Field label="Search description">
              <input className="input" name="search" value={filters.search} onChange={handleFilterChange} placeholder="Salary, rent, groceries..." />
            </Field>
          </div>
          <Field label="Type">
            <select className="select" name="type" value={filters.type} onChange={handleFilterChange}>
              <option value="">All</option>
              {TRANSACTION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {TRANSACTION_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Category">
            <select className="select" name="category" value={filters.category} onChange={handleFilterChange}>
              <option value="">All</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Sort by">
            <select className="select" name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="createdAt">Created</option>
            </select>
          </Field>
          <Field label="Order">
            <select className="select" name="sortOrder" value={filters.sortOrder} onChange={handleFilterChange}>
              <option value="desc">Newest</option>
              <option value="asc">Oldest</option>
            </select>
          </Field>
          <div className="flex items-end gap-3 lg:col-span-6">
            <Button type="submit">Apply filters</Button>
            <Button type="button" variant="secondary" onClick={clearFilters}>
              Reset
            </Button>
          </div>
        </form>
      </Card>

      {error ? (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="subtle-label">List</div>
              <h2 className="mt-2 text-xl font-semibold text-white">Transaction records</h2>
            </div>
            {pagination ? (
              <Badge tone="info">
                Page {pagination.page} of {pagination.totalPages || 1}
              </Badge>
            ) : null}
          </div>

          {loading ? <Spinner className="min-h-[300px]" /> : null}

          {!loading && !transactions.length ? (
            <div className="mt-6">
              <EmptyState title="No transactions found" description="Try different filters or add your first transaction." />
            </div>
          ) : null}

          {!loading && transactions.length ? (
            <div className="mt-6 overflow-x-auto rounded-[1.25rem] border border-white/10">
              <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                <thead className="bg-white/5 text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Description</th>
                    {canManage ? <th className="px-4 py-3 font-medium">Actions</th> : null}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-slate-950/20">
                  {transactions.map((transaction) => (
                    <tr key={transaction._id} className="text-slate-300">
                      <td className="px-4 py-3">{formatDate(transaction.date || transaction.createdAt)}</td>
                      <td className="px-4 py-3 capitalize">{transaction.category}</td>
                      <td className="px-4 py-3 capitalize">
                        <Badge tone={transaction.type === 'income' ? 'success' : 'warning'}>
                          {TRANSACTION_TYPE_LABELS[transaction.type]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">{formatCurrency(transaction.amount)}</td>
                      <td className="px-4 py-3">{transaction.description || 'No description'}</td>
                      {canManage ? (
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <Button variant="secondary" onClick={() => startEdit(transaction)}>
                              Edit
                            </Button>
                            <Button variant="ghost" onClick={() => removeTransaction(transaction)}>
                              Delete
                            </Button>
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {pagination ? (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
              <div>
                Showing {transactions.length} of {pagination.total} records
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" disabled={!pagination.hasPrevPage || loading} onClick={() => setPage((current) => Math.max(current - 1, 1))}>
                  Previous
                </Button>
                <Button variant="secondary" disabled={!pagination.hasNextPage || loading} onClick={() => setPage((current) => current + 1)}>
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </Card>

        {canManage ? (
          <Card className="p-6">
            <div className="subtle-label">Editor</div>
            <h2 className="mt-2 text-xl font-semibold text-white">{editingId ? 'Update transaction' : 'New transaction'}</h2>
            <form className="mt-6 space-y-4" onSubmit={submitTransaction}>
              <Field label="Amount">
                <input className="input" type="number" min="0.01" step="0.01" name="amount" value={form.amount} onChange={handleFormChange} required />
              </Field>
              <Field label="Type">
                <select className="select" name="type" value={form.type} onChange={handleFormChange}>
                  {TRANSACTION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {TRANSACTION_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Category">
                <select className="select" name="category" value={form.category} onChange={handleFormChange}>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Date">
                <input className="input" type="date" name="date" value={form.date} onChange={handleFormChange} required />
              </Field>
              <Field label="Description">
                <textarea
                  className="input min-h-[120px]"
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="Add a short note about this transaction"
                />
              </Field>

              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Update transaction' : 'Create transaction'}
                </Button>
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Clear
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <Card className="p-6">
            <div className="subtle-label">Access</div>
            <h2 className="mt-2 text-xl font-semibold text-white">Viewer mode</h2>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              This account can inspect transaction history but cannot create, update, or delete records.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};