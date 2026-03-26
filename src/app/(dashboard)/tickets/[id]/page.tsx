'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { useTicket, useUpdateTicket, useTicketComments, useAddComment, useTicketHistory } from '@/hooks/use-tickets';
import { useCategories, useAgents } from '@/hooks/use-data';
import { PRIORITY_CONFIG, STATUS_CONFIG, PRIORITIES, STATUSES } from '@/lib/constants';
import { formatDateTime, timeAgo, cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowLeft, Send, Lock, Clock, User, Tag, MessageSquare, History } from 'lucide-react';
import Link from 'next/link';

export default function TicketDetailPage() {
  const { id } = useParams();
  const ticketId = Number(id);
  const { data: ticket, isLoading } = useTicket(ticketId);
  const { data: comments } = useTicketComments(ticketId);
  const { data: history } = useTicketHistory(ticketId);
  const { data: agents } = useAgents();
  const updateTicket = useUpdateTicket(ticketId);
  const addComment = useAddComment(ticketId);

  const [commentText, setCommentText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'history'>('comments');

  if (isLoading) {
    return (
      <>
        <Header title="Loading..." />
        <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
      </>
    );
  }
  if (!ticket) {
    return (
      <>
        <Header title="Not Found" />
        <div className="flex-1 flex items-center justify-center"><p className="text-slate-500">Ticket not found</p></div>
      </>
    );
  }

  const pc = PRIORITY_CONFIG[ticket.priority as keyof typeof PRIORITY_CONFIG];
  const sc = STATUS_CONFIG[ticket.status as keyof typeof STATUS_CONFIG];

  const handleStatusChange = (status: string) => updateTicket.mutate({ status });
  const handlePriorityChange = (priority: string) => updateTicket.mutate({ priority: priority as any });
  const handleAssigneeChange = (assigneeId: string) => updateTicket.mutate({ assigneeId: assigneeId ? Number(assigneeId) : null });

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    await addComment.mutateAsync({ commentText: commentText.trim(), isInternal });
    setCommentText('');
  };

  return (
    <>
      <Header title={ticket.ticketNumber} subtitle={ticket.title} actions={
        <Link href="/tickets" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"><ArrowLeft className="w-4 h-4" /> Back</Link>
      } />
      <div className="p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Description */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Description</h3>
              <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                {ticket.description || <span className="text-slate-400 italic">No description provided</span>}
              </p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex border-b border-slate-200">
                <button onClick={() => setActiveTab('comments')}
                  className={cn('px-5 py-3 text-sm font-medium flex items-center gap-2 border-b-2 -mb-px transition-colors',
                    activeTab === 'comments' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700')}>
                  <MessageSquare className="w-4 h-4" /> Comments {comments?.length ? `(${comments.length})` : ''}
                </button>
                <button onClick={() => setActiveTab('history')}
                  className={cn('px-5 py-3 text-sm font-medium flex items-center gap-2 border-b-2 -mb-px transition-colors',
                    activeTab === 'history' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700')}>
                  <History className="w-4 h-4" /> History
                </button>
              </div>

              {activeTab === 'comments' && (
                <div>
                  {/* Comments list */}
                  <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                    <AnimatePresence>
                      {comments?.map((c) => (
                        <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          className={cn('px-6 py-4', c.isInternal && 'bg-amber-50/60')}>
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                              {c.user?.fullName?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </div>
                            <span className="text-sm font-medium text-slate-800">{c.user?.fullName}</span>
                            {c.user?.role && <span className="text-[10px] font-medium text-slate-400 uppercase">{c.user.role}</span>}
                            {c.isInternal && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                                <Lock className="w-2.5 h-2.5" /> Internal
                              </span>
                            )}
                            <span className="text-xs text-slate-400 ml-auto">{timeAgo(c.createdAt)}</span>
                          </div>
                          <p className="text-sm text-slate-600 ml-9 whitespace-pre-wrap">{c.commentText}</p>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {(!comments || comments.length === 0) && (
                      <div className="px-6 py-10 text-center text-sm text-slate-400">No comments yet</div>
                    )}
                  </div>

                  {/* Add comment */}
                  <div className="border-t border-slate-200 p-4">
                    <div className="flex items-start gap-3">
                      <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} rows={2}
                        placeholder="Add a comment..." className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none" />
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
                        <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500" />
                        <Lock className="w-3.5 h-3.5 text-amber-600" /> Internal note
                      </label>
                      <button onClick={handleAddComment} disabled={!commentText.trim() || addComment.isPending}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white text-sm font-semibold rounded-xl transition-colors">
                        {addComment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                  {history && history.length > 0 ? (
                    history.map((h) => {
                      const fieldLabels: Record<string, string> = { priority: 'Priority', status: 'Status', assignee: 'Assignee', category: 'Category' };
                      const label = fieldLabels[h.fieldChanged] || h.fieldChanged;
                      const oldDisplay = h.fieldChanged === 'status' ? (STATUS_CONFIG[h.oldValue as keyof typeof STATUS_CONFIG]?.label || h.oldValue) :
                                         h.fieldChanged === 'priority' ? (PRIORITY_CONFIG[h.oldValue as keyof typeof PRIORITY_CONFIG]?.label || h.oldValue) : (h.oldValue || '—');
                      const newDisplay = h.fieldChanged === 'status' ? (STATUS_CONFIG[h.newValue as keyof typeof STATUS_CONFIG]?.label || h.newValue) :
                                         h.fieldChanged === 'priority' ? (PRIORITY_CONFIG[h.newValue as keyof typeof PRIORITY_CONFIG]?.label || h.newValue) : (h.newValue || '—');
                      return (
                        <div key={h.id} className="px-6 py-3.5 flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                            <History className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-700">
                              <span className="font-medium">{h.user?.fullName || 'System'}</span>
                              {' changed '}
                              <span className="font-medium">{label}</span>
                              {' from '}
                              <span className="font-medium text-slate-500">{oldDisplay}</span>
                              {' to '}
                              <span className="font-medium text-blue-700">{newDisplay}</span>
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">{timeAgo(h.createdAt)}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-6 py-10 text-center text-sm text-slate-400">No changes recorded yet</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Status & Priority */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
                <select value={ticket.status} onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                  {STATUSES.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Priority</label>
                <select value={ticket.priority} onChange={(e) => handlePriorityChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                  {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Assignee</label>
                <select value={ticket.assigneeId || ''} onChange={(e) => handleAssigneeChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                  <option value="">Unassigned</option>
                  {agents?.map((a) => <option key={a.id} value={a.id}>{a.fullName}</option>)}
                </select>
              </div>
            </div>

            {/* Details */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
              <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Details</h4>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">Requester:</span>
                  <span className="text-slate-800 font-medium">{ticket.requester?.fullName}</span>
                </div>
                {ticket.category && (
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-500">Category:</span>
                    <span className="text-slate-800 font-medium">{ticket.category.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">Created:</span>
                  <span className="text-slate-800">{formatDateTime(ticket.createdAt)}</span>
                </div>
                {ticket.resolvedAt && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    <span className="text-slate-500">Resolved:</span>
                    <span className="text-slate-800">{formatDateTime(ticket.resolvedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Resolution notes */}
            {ticket.resolutionNotes && (
              <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-5">
                <h4 className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider mb-2">Resolution Notes</h4>
                <p className="text-sm text-emerald-800">{ticket.resolutionNotes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
