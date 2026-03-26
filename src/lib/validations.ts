import { z } from 'zod';

export const TicketPriority = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
export const TicketStatus = z.enum(['NEW', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED']);
export const UserRole = z.enum(['ADMIN', 'AGENT', 'USER']);

export const createTicketSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().optional(),
  priority: TicketPriority.default('MEDIUM'),
  categoryId: z.number().optional().nullable(),
  assigneeId: z.number().optional().nullable(),
});

export const updateTicketSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().optional(),
  priority: TicketPriority.optional(),
  status: TicketStatus.optional(),
  categoryId: z.number().nullable().optional(),
  assigneeId: z.number().nullable().optional(),
  resolutionNotes: z.string().optional(),
});

export const createCommentSchema = z.object({
  commentText: z.string().min(1, 'Comment cannot be empty'),
  isInternal: z.boolean().default(false),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
