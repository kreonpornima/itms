'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Ticket, Comment, HistoryEntry } from '@/types';
import type { CreateTicketInput, UpdateTicketInput, CreateCommentInput } from '@/lib/validations';

export function useTickets(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ['tickets', filters],
    queryFn: () => apiClient.get<Ticket[]>('/api/tickets', filters),
    refetchInterval: 30000,
  });
}

export function useTicket(id: number) {
  return useQuery({
    queryKey: ['tickets', id],
    queryFn: () => apiClient.get<Ticket>(`/api/tickets/${id}`),
    enabled: !!id,
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTicketInput) => apiClient.post<Ticket>('/api/tickets', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tickets'] }),
  });
}

export function useUpdateTicket(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateTicketInput) => apiClient.patch<Ticket>(`/api/tickets/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets'] });
      qc.invalidateQueries({ queryKey: ['tickets', id] });
    },
  });
}

export function useTicketComments(ticketId: number) {
  return useQuery({
    queryKey: ['tickets', ticketId, 'comments'],
    queryFn: () => apiClient.get<Comment[]>(`/api/tickets/${ticketId}/comments`),
    enabled: !!ticketId,
  });
}

export function useAddComment(ticketId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCommentInput) => apiClient.post<Comment>(`/api/tickets/${ticketId}/comments`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets', ticketId, 'comments'] });
      qc.invalidateQueries({ queryKey: ['tickets', ticketId] });
    },
  });
}

export function useTicketHistory(ticketId: number) {
  return useQuery({
    queryKey: ['tickets', ticketId, 'history'],
    queryFn: () => apiClient.get<HistoryEntry[]>(`/api/tickets/${ticketId}/history`),
    enabled: !!ticketId,
  });
}
