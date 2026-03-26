'use client';
import { Header } from '@/components/layout/header';
import { useAuth } from '@/components/auth-provider';
import { Shield, Info } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <>
      <Header title="Settings" subtitle="System configuration" />
      <div className="p-6 lg:p-8 max-w-2xl space-y-5">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-700">Your Profile</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex"><span className="w-32 text-slate-500">Name</span><span className="text-slate-800 font-medium">{user?.fullName}</span></div>
            <div className="flex"><span className="w-32 text-slate-500">Email</span><span className="text-slate-800">{user?.email}</span></div>
            <div className="flex"><span className="w-32 text-slate-500">Role</span><span className="text-slate-800 font-medium">{user?.role}</span></div>
            <div className="flex"><span className="w-32 text-slate-500">Username</span><span className="text-slate-800">{user?.username}</span></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-700">System Information</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex"><span className="w-32 text-slate-500">Version</span><span className="text-slate-800">1.0.0</span></div>
            <div className="flex"><span className="w-32 text-slate-500">Framework</span><span className="text-slate-800">Next.js 14</span></div>
            <div className="flex"><span className="w-32 text-slate-500">ORM</span><span className="text-slate-800">Prisma</span></div>
          </div>
        </div>
      </div>
    </>
  );
}
