import { create } from 'zustand';

/**
 * Text currently typed into the persistent search header (PersistentSearchHeader,
 * mounted once in the root layout so the header itself never remounts across
 * navigation). Not persisted across app restarts — only shared in-memory
 * between the header and SearchScreen for the current session.
 *
 * `submittedQuery`/`submitCount` exist because the header can trigger a new
 * search while SearchScreen is already mounted (e.g. user edits + resubmits
 * without navigating away) — a plain query string wouldn't re-trigger
 * SearchScreen's effect if the resubmitted text happens to match the
 * previous value, so a monotonic counter is used instead of diffing text.
 */
interface SearchInputState {
  query: string;
  setQuery: (query: string) => void;
  submittedQuery: string;
  submitCount: number;
  submit: (query: string) => void;
}

export const useSearchInputStore = create<SearchInputState>()((set) => ({
  query: '',
  setQuery: (query) => set({ query }),
  submittedQuery: '',
  submitCount: 0,
  submit: (query) => set((state) => ({ submittedQuery: query, submitCount: state.submitCount + 1 })),
}));
