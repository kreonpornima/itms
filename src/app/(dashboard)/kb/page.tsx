'use client';
import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { useKBArticles } from '@/hooks/use-data';
import { Search, BookOpen, ThumbsUp, Eye, Loader2 } from 'lucide-react';
import { timeAgo } from '@/lib/utils';
import Link from 'next/link';

export default function KBPage() {
  const [search, setSearch] = useState('');
  const { data: articles, isLoading } = useKBArticles(search || undefined);

  return (
    <>
      <Header title="Knowledge Base" subtitle="Searchable solution articles" />
      <div className="p-6 lg:p-8 space-y-5">
        <div className="relative max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search articles..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
        ) : !articles?.length ? (
          <div className="text-center py-20">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No articles found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((a) => (
              <Link key={a.id} href={`/kb/${a.id}`} className="block bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-blue-200 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-800 line-clamp-2">{a.title}</h3>
                </div>
                {a.summary && <p className="text-xs text-slate-500 mb-3 line-clamp-2">{a.summary}</p>}
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  {a.category && <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{a.category.name}</span>}
                  <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {a.helpfulCount}</span>
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {a.viewCount}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
