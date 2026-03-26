'use client';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { KBArticle, Category, User } from '@/types';

export function useKBArticles(search?: string) {
  return useQuery({
    queryKey: ['kb', search],
    queryFn: () => apiClient.get<KBArticle[]>('/api/kb', search ? { search } : undefined),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.get<Category[]>('/api/categories'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: () => apiClient.get<User[]>('/api/users', { role: 'AGENT' }),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.get<User[]>('/api/users'),
    staleTime: 5 * 60 * 1000,
  });
}
