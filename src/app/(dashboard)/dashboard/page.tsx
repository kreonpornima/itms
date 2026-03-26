'use client';
import { Header } from '@/components/layout/header';
import { useDashboard } from '@/hooks/use-dashboard';
import { PRIORITY_CONFIG, STATUS_CONFIG } from '@/lib/constants';
import { timeAgo } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Ticket, AlertTriangle, ShieldAlert, CheckCircle2, Clock,
  ArrowUpRight, Loader2,
} from 'lucide-react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <>
        <Header title="Dashboard" subtitle="Overview of your ticket management" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </>
    );
  }

  if (!data) return null;

  const statCards = [
    { label: 'Open Tickets', value: data.totalOpen, icon: Ticket, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Urgent', value: data.totalUrgent, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'SLA Breached', value: data.totalBreached, icon: ShieldAlert, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Resolved Today', value: data.resolvedToday, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  const PIE_COLORS = ['#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#10B981', '#6B7280'];

  return (
    <>
      <Header title="Dashboard" subtitle="Overview of your ticket management" />
      <div className="p-6 lg:p-8 space-y-6">
        {/* Stat cards */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <motion.div key={s.label} variants={item} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">{s.label}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{s.value}</p>
                </div>
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', s.bg)}>
                  <s.icon className={cn('w-6 h-6', s.color)} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Avg resolution */}
        <motion.div variants={item} initial="hidden" animate="show" className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
            <Clock className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Avg. Resolution Time (30d)</p>
            <p className="text-lg font-bold text-slate-900">{data.avgResolutionHours}h</p>
          </div>
        </motion.div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 7-day trend */}
          <motion.div variants={item} initial="hidden" animate="show" className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Tickets Created (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(v) => new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13 }}
                  labelFormatter={(v) => new Date(v).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} name="Tickets" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* By status */}
          <motion.div variants={item} initial="hidden" animate="show" className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">By Status</h3>
            {data.ticketsByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={data.ticketsByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={3}>
                    {data.ticketsByStatus.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-60 flex items-center justify-center text-slate-400 text-sm">No data</div>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {data.ticketsByStatus.map((s, i) => {
                const cfg = STATUS_CONFIG[s.status as keyof typeof STATUS_CONFIG];
                return (
                  <span key={s.status} className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    {cfg?.label || s.status} ({s.count})
                  </span>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Recent tickets */}
        <motion.div variants={item} initial="hidden" animate="show" className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Recent Tickets</h3>
            <Link href="/tickets" className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {data.recentTickets.map((t: any) => {
              const pc = PRIORITY_CONFIG[t.priority as keyof typeof PRIORITY_CONFIG];
              const sc = STATUS_CONFIG[t.status as keyof typeof STATUS_CONFIG];
              return (
                <Link key={t.id} href={`/tickets/${t.id}`} className="flex items-center px-6 py-3.5 hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">{t.ticketNumber}</span>
                      <span className="text-sm font-medium text-slate-800 truncate">{t.title}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400">{t.requester?.fullName}</span>
                      {t.category && <span className="text-xs text-slate-400">· {t.category.name}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    {pc && <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full border', pc.color)}>{pc.label}</span>}
                    {sc && <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full border', sc.color)}>{sc.label}</span>}
                    <span className="text-xs text-slate-400 w-16 text-right">{timeAgo(t.createdAt)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>
      </div>
    </>
  );
}
