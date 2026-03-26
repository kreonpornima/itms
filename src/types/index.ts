export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  department?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Ticket {
  id: number;
  ticketNumber: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  categoryId?: number;
  category?: Category;
  requesterId: number;
  requester?: User;
  assigneeId?: number;
  assignee?: User;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  firstResponseAt?: string;
  assignedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  resolutionNotes?: string;
  _count?: { comments: number };
}

export interface Comment {
  id: number;
  ticketId: number;
  userId: number;
  user?: Pick<User, 'id' | 'fullName' | 'email' | 'role'>;
  commentText: string;
  isInternal: boolean;
  createdAt: string;
  editedAt?: string;
}

export interface Category {
  id: number;
  name: string;
  parentId?: number;
  description?: string;
  isActive: boolean;
  parent?: Category;
  children?: Category[];
}

export interface KBArticle {
  id: number;
  title: string;
  content: string;
  summary?: string;
  categoryId?: number;
  category?: Category;
  keywords?: string;
  isPublished: boolean;
  viewCount: number;
  helpfulCount: number;
  createdBy: number;
  creator?: { fullName: string };
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalOpen: number;
  totalUrgent: number;
  totalBreached: number;
  resolvedToday: number;
  avgResolutionHours: number;
  ticketsByStatus: { status: string; count: number }[];
  ticketsByPriority: { priority: string; count: number }[];
  recentTickets: Ticket[];
  dailyTrend: { date: string; count: number }[];
}

export interface HistoryEntry {
  id: number;
  ticketId: number;
  fieldChanged: string;
  oldValue: string | null;
  newValue: string | null;
  changedBy: number;
  user?: Pick<User, 'id' | 'fullName' | 'email'>;
  createdAt: string;
}
