/**
 * Module-level store so the feedback list and detail screens
 * share the same in-memory array (including newly submitted items).
 */
import { FeedbackItem } from '@/types';
import { FEEDBACKS } from './mockData';

let _feedbacks: FeedbackItem[] = [...FEEDBACKS];

export const feedbackStore = {
  getAll: (): FeedbackItem[] => _feedbacks,
  getById: (id: string): FeedbackItem | undefined => _feedbacks.find((f) => f.id === id),
  prepend: (item: FeedbackItem): void => {
    _feedbacks = [item, ..._feedbacks];
  },
};
