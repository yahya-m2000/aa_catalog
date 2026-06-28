import { z } from 'zod';

export const productSearchQuerySchema = z.object({
  q: z.string().trim().optional(),
  sort: z.enum(['relevance', 'price_asc', 'price_desc', 'newest', 'popular']).default('relevance'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export type ProductSearchQuery = z.infer<typeof productSearchQuerySchema>;
