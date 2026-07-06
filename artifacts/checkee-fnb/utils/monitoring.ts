import { SampleRetention } from '@/types';

export type MonitoringTag = 'active' | 'inactive' | null;

/**
 * Derives the "Đang theo dõi" / "Ngưng hoạt động" tag from the meal's sample
 * retention record instead of an arbitrary expiry date.
 *
 * - No sample record yet, or the meal hasn't been served yet (`future`):
 *   monitoring hasn't started, so no tag should be shown at all (null).
 * - `active` (sample stored within the 24–72h retention window): "Đang theo dõi".
 * - `expired` / `disposed`: retention window has passed → "Ngưng hoạt động".
 */
export function getMonitoringTag(sampleStatus?: SampleRetention['status']): MonitoringTag {
  if (!sampleStatus || sampleStatus === 'future') return null;
  return sampleStatus === 'active' ? 'active' : 'inactive';
}
