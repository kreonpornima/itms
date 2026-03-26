'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { useTickets } from '@/hooks/use-tickets';
import { PRIORITY_CONFIG, STATUS_CONFIG, PRIORITIES, STATUSES } from '@/lib/constants';
import { timeAgo, cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Plus, Search, X, Loader2, MessageSquare, Filter } from 'lucide-react';

export default function TicketsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const filters: Record<string, string> = {};
  if (search) filters.search = search;
  if (statusFilter) filters.status = statusFilter;
  if (priorityFilter) filters.priority = priorityFilter;

  const { data: tickets, isLoading } = useTickets(Object.keys(filters).length > 0 ? filters : undefined);
  const hasFilters = search || statusFilter || priorityFilter;

  return (
    <>
      <Header
        title="Tickets"
        subtitle={`${tickets?.length || 0} tickets`}
        actions={
          <Link href="/tickets/new" className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> New Ticket
          </Link>
        }
      />
      <div className="p-6 lg:p-8 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tickets..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
            <option value="">All Status</option>
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
          </select>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
            <option value="">All Priority</option>
            {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>)}
          </select>
          {hasFilters && (
            <button onClick={() => { setSearch(''); setStatusFilter(''); setPriorityFilter(''); }}
              className="px-3 py-2.5 text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
              <X className="w-4 h-4" /> Clear
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
        ) : !tickets?.length ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4"><Filter className="w-7 h-7 text-slate-400" /></div>
            <p className="text-slate-500 font-medium">No tickets found</p>
            <p className="text-sm text-slate-400 mt-1">Try adjusting your filters or create a new ticket</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Ticket</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Assignee</th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((t, i) => {
                  const pc = PRIORITY_CONFIG[t.priority as keyof typeof PRIORITY_CONFIG];
                  const sc = STATUS_CONFIG[t.status as keyof typeof STATUS_CONFIG];
                  return (
                    <motion.tr key={t.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                      className="hover:bg-blue-50/50 transition-colors group">
                      <td className="px-5 py-3.5">
                        <Link href={`/tickets/${t.id}`} className="text-xs font-mono text-blue-600 hover:text-blue-800 font-medium">{t.ticketNumber}</Link>
                      </td>
                      <td className="px-5 py-3.5 max-w-xs">
                        <Link href={`/tickets/${t.id}`} className="block">
                          <span className="text-sm font-medium text-slate-800 group-hover:text-blue-700 line-clamp-1">{t.title}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            {t.category && <span className="text-xs text-slate-400">{t.category.name}</span>}
                            {t.requester && <span className="text-xs text-slate-400">· {t.requester.fullName}</span>}
                            {(t._count?.comments || 0) > 0 && (
                              <span className="inline-flex items-center gap-0.5 text-xs text-slate-400"><MessageSquare className="w-3 h-3" /> {t._count?.comments}</span>
                            )}
                          </div>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">{pc && <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap', pc.color)}>{pc.label}</span>}</td>
                      <td className="px-5 py-3.5">{sc && <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap', sc.color)}>{sc.label}</span>}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">{t.assignee?.fullName || <span className="text-slate-300 italic text-xs">Unassigned</span>}</td>
                      <td className="px-5 py-3.5 text-right text-xs text-slate-400 whitespace-nowrap">{timeAgo(t.createdAt)}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
