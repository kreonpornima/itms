'use client';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { useCreateTicket } from '@/hooks/use-tickets';
import { useCategories, useAgents } from '@/hooks/use-data';
import { PRIORITIES, PRIORITY_CONFIG } from '@/lib/constants';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTicketSchema, type CreateTicketInput } from '@/lib/validations';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewTicketPage() {
  const router = useRouter();
  const createTicket = useCreateTicket();
  const { data: categories } = useCategories();
  const { data: agents } = useAgents();

  const { register, handleSubmit, formState: { errors } } = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: { priority: 'MEDIUM' },
  });

  const onSubmit = async (data: CreateTicketInput) => {
    try {
      const ticket = await createTicket.mutateAsync(data);
      router.push(`/tickets/${ticket.id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to create ticket');
    }
  };

  const parentCats = categories?.filter((c) => !c.parentId) || [];

  return (
    <>
      <Header title="Create Ticket" actions={
        <Link href="/tickets" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"><ArrowLeft className="w-4 h-4" /> Back</Link>
      } />
      <div className="p-6 lg:p-8 max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title <span className="text-red-500">*</span></label>
            <input {...register('title')} placeholder="Brief description of the issue"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea {...register('description')} rows={4} placeholder="Detailed description..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 resize-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
              <select {...register('priority')} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
              <select {...register('categoryId', { setValueAs: (v) => v ? Number(v) : null })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                <option value="">Select category</option>
                {parentCats.map((pc) => (
                  <optgroup key={pc.id} label={pc.name}>
                    <option value={pc.id}>{pc.name} (General)</option>
                    {pc.children?.map((ch) => <option key={ch.id} value={ch.id}>{ch.name}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Assign To</label>
            <select {...register('assigneeId', { setValueAs: (v) => v ? Number(v) : null })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
              <option value="">Unassigned</option>
              {agents?.map((a) => <option key={a.id} value={a.id}>{a.fullName}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={createTicket.isPending}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-semibold text-sm rounded-xl transition-colors flex items-center gap-2">
              {createTicket.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Create Ticket
            </button>
            <Link href="/tickets" className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl">Cancel</Link>
          </div>
        </form>
      </div>
    </>
  );
}
