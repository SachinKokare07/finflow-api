import { useEffect, useMemo, useState } from 'react';
import { dashboardApi } from '../api/client';
import { SectionHeader, MetricCard, Card, Badge, EmptyState, Spinner } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, formatDateTime, formatPercent } from '../utils/format';

const toSeries = (trends = []) =>
  trends.map((item) => {
    const income = item.data?.find((entry) => entry.type === 'income')?.total || 0;
    const expense = item.data?.find((entry) => entry.type === 'expense')?.total || 0;
    return {
      label: item.monthLabel || `${item.month}`,
      income,
      expense,
      total: Number(income) + Number(expense),
    };
  });

export const DashboardPage = () => {
  const { role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [trends, setTrends] = useState([]);
  const [recent, setRecent] = useState([]);
  const [weekly, setWeekly] = useState(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [summaryResponse, categoryResponse, trendResponse, recentResponse, weeklyResponse] = await Promise.all([
          dashboardApi.summary(),
          dashboardApi.categories('type=expense'),
          dashboardApi.trends('months=6'),
          dashboardApi.recent('limit=8'),
          dashboardApi.weekly(),
        ]);

        if (!active) return;
        setSummary(summaryResponse.summary);
        setCategories(categoryResponse.categories || []);
        setTrends(toSeries(trendResponse.trends || []));
        setRecent(recentResponse.transactions || []);
        setWeekly(weeklyResponse);
      } catch (requestError) {
        if (active) setError(requestError.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const chartPeak = useMemo(() => {
    const max = Math.max(...trends.flatMap((item) => [Number(item.income || 0), Number(item.expense || 0)]), 1);
    return max;
  }, [trends]);

  if (loading) {
    return <Spinner className="min-h-[50vh]" />;
  }

  if (error) {
    return <EmptyState title="Dashboard unavailable" description={error} />;
  }

  if (!summary) {
    return <EmptyState title="No summary data yet" description="Add transactions to surface the dashboard metrics." />;
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Overview"
        title="Finance snapshot"
        description="Read income, expense, and momentum signals from recent activity and historical trend data."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Income"
          value={formatCurrency(summary.income)}
          delta={`${summary.incomeCount} entries`}
          accent="from-emerald-400/25 to-transparent"
          icon={<span>+</span>}
        />
        <MetricCard
          label="Expense"
          value={formatCurrency(summary.expense)}
          delta={`${summary.expenseCount} entries`}
          accent="from-rose-400/25 to-transparent"
          icon={<span>-</span>}
        />
        <MetricCard
          label="Net balance"
          value={formatCurrency(summary.netBalance)}
          delta={`${summary.totalTransactions} total transactions`}
          accent="from-sky-400/25 to-transparent"
          icon={<span>↔</span>}
        />
        <MetricCard
          label="Savings rate"
          value={formatPercent(summary.savingsRate)}
          delta={summary.savingsRate >= 0 ? 'Healthy runway' : 'Expenses exceed income'}
          accent="from-amber-400/25 to-transparent"
          icon={<span>%</span>}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="subtle-label">Trend line</div>
              <h2 className="mt-2 text-xl font-semibold text-white">Monthly cash movement</h2>
            </div>
            <Badge tone="info">Past 6 months</Badge>
          </div>

          <div className="mt-8 h-[320px] rounded-[1.5rem] border border-white/10 bg-slate-950/30 p-4">
            {trends.length ? (
              <div className="grid h-full grid-cols-6 items-end gap-4">
                {trends.map((item) => (
                  <div key={item.label} className="flex h-full flex-col items-center justify-end gap-3">
                    <div className="flex h-full w-full items-end gap-2">
                      <div
                        className="flex-1 rounded-t-2xl bg-gradient-to-t from-emerald-500 to-teal-300"
                        style={{ height: `${Math.max((item.income / chartPeak) * 100, 8)}%` }}
                        title={`Income ${formatCurrency(item.income)}`}
                      />
                      <div
                        className="flex-1 rounded-t-2xl bg-gradient-to-t from-rose-500 to-coral"
                        style={{ height: `${Math.max((item.expense / chartPeak) * 100, 8)}%` }}
                        title={`Expense ${formatCurrency(item.expense)}`}
                      />
                    </div>
                    <div className="text-xs font-semibold text-slate-400">{item.label}</div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No trend data"
                description="Add records across different months to populate this chart."
              />
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="subtle-label">Weekly comparison</div>
            <h2 className="mt-2 text-xl font-semibold text-white">Week-over-week totals</h2>
            {weekly ? (
              <div className="mt-6 space-y-4 text-sm">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>This week income</span>
                    <span className="font-semibold text-white">{formatCurrency(weekly.thisWeek.income)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-slate-400">
                    <span>This week expense</span>
                    <span className="font-semibold text-white">{formatCurrency(weekly.thisWeek.expense)}</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Last week income</span>
                    <span className="font-semibold text-white">{formatCurrency(weekly.lastWeek.income)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-slate-400">
                    <span>Last week expense</span>
                    <span className="font-semibold text-white">{formatCurrency(weekly.lastWeek.expense)}</span>
                  </div>
                </div>
              </div>
            ) : null}
          </Card>

          <Card className="p-6">
            <div className="subtle-label">Top categories</div>
            <h2 className="mt-2 text-xl font-semibold text-white">Highest spend categories</h2>
            <div className="mt-5 space-y-3">
              {categories.slice(0, 5).map((category) => (
                <div key={category.category} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-white">{category.category}</div>
                      <div className="text-xs text-slate-400">{category.breakdown?.length || 0} type groups</div>
                    </div>
                    <div className="text-right text-sm font-semibold text-slate-100">
                      {formatCurrency(category.categoryTotal)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="subtle-label">Recent activity</div>
            <h2 className="mt-2 text-xl font-semibold text-white">Recent entries</h2>
          </div>
          <Badge tone="neutral">{recent.length} shown</Badge>
        </div>

        <div className="mt-6 overflow-x-auto rounded-[1.25rem] border border-white/10">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead className="bg-white/5 text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Created by</th>
                <th className="px-4 py-3 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-slate-950/20">
              {recent.map((transaction) => (
                <tr key={transaction._id} className="text-slate-300">
                  <td className="px-4 py-3">{formatDateTime(transaction.date || transaction.createdAt)}</td>
                  <td className="px-4 py-3 capitalize">{transaction.category}</td>
                  <td className="px-4 py-3 capitalize">{transaction.type}</td>
                  <td className="px-4 py-3 font-semibold text-white">{formatCurrency(transaction.amount)}</td>
                  <td className="px-4 py-3">{transaction.createdBy?.name || 'System'}</td>
                  <td className="px-4 py-3">{transaction.description || 'No description'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!recent.length ? (
          <div className="mt-6">
            <EmptyState title="No recent activity" description="Recent records will show up here after transactions are added." />
          </div>
        ) : null}
      </Card>
    </div>
  );
};