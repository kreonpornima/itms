export const PRIORITY_CONFIG = {
  LOW: { label: 'Low', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  MEDIUM: { label: 'Medium', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  HIGH: { label: 'High', color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
  URGENT: { label: 'Urgent', color: 'bg-red-600 text-white border-red-600', dot: 'bg-white' },
} as const;

export const STATUS_CONFIG = {
  NEW: { label: 'New', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  ASSIGNED: { label: 'Assigned', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-violet-50 text-violet-700 border-violet-200' },
  ON_HOLD: { label: 'On Hold', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  RESOLVED: { label: 'Resolved', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CLOSED: { label: 'Closed', color: 'bg-gray-100 text-gray-500 border-gray-200' },
} as const;

export const ROLE_CONFIG = {
  ADMIN: { label: 'Admin', color: 'bg-purple-50 text-purple-700' },
  AGENT: { label: 'Agent', color: 'bg-blue-50 text-blue-700' },
  USER: { label: 'User', color: 'bg-gray-50 text-gray-700' },
} as const;

export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
export const STATUSES = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED'] as const;
