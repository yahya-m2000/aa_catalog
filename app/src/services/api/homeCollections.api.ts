import { apiGet } from './client';
import type { HomeCollection } from '@/types/homeCollection';

export function getHomeCollections(): Promise<HomeCollection[]> {
  return apiGet<HomeCollection[]>('/api/home/collections');
}
