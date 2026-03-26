'use client';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Header } from '@/components/layout/header';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Loader2, ThumbsUp, Eye, Tag } from 'lucide-react';
import Link from 'next/link';
import type { KBArticle } from '@/types';

export default function KBArticleDetailPage() {
  const { id } = useParams();
  const articleId = Number(id);

  const { data: article, isLoading } = useQuery({
    queryKey: ['kb', articleId],
    queryFn: () => apiClient.get<KBArticle>(`/api/kb/${articleId}`),
    enabled: !!articleId,
  });

  if (isLoading) {
    return (
      <>
        <Header title="Loading..." />
        <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
      </>
    );
  }

  if (!article) {
    return (
      <>
        <Header title="Not Found" />
        <div className="flex-1 flex items-center justify-center"><p className="text-slate-500">Article not found</p></div>
      </>
    );
  }

  return (
    <>
      <Header title="Knowledge Base" actions={
        <Link href="/kb" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"><ArrowLeft className="w-4 h-4" /> Back</Link>
      } />
      <div className="p-6 lg:p-8 max-w-3xl">
        <article className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h1 className="text-xl font-bold text-slate-900 mb-3">{article.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              {article.category && (
                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  <Tag className="w-3 h-3" /> {article.category.name}
                </span>
              )}
              <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {article.helpfulCount} helpful</span>
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {article.viewCount} views</span>
              {article.creator && <span>By {article.creator.fullName}</span>}
              <span>{formatDate(article.createdAt)}</span>
            </div>
          </div>
          {article.summary && (
            <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
              <p className="text-sm text-blue-800 font-medium">{article.summary}</p>
            </div>
          )}
          <div className="p-6">
            <div className="prose prose-sm prose-slate max-w-none whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {article.content}
            </div>
          </div>
        </article>
      </div>
    </>
  );
}
