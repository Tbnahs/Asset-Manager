import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { MealSession } from '@/types';

/** Returns today's date as 'yyyy-MM-dd' in the device's local timezone. */
function localDateISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export interface IngredientRow {
  name: string;
  supplier: string;
  unit: string;
  quantity: string;
}

/** Retention duration a sampler can pick when saving a sample, in hours. */
export type RetentionHours = 24 | 72;

export interface SamplerRecord {
  id: string;
  mealId: string;
  mealName: string;
  mealImage: number;
  session: MealSession;
  recordedAt: string;   // 'dd/MM/yyyy HH:mm'
  recordedDate: string; // 'yyyy-MM-dd' for grouping/dedup
  recordedBy: string;
  // Legacy fields (kept for old records)
  storageLocation?: string;
  sampleCount?: number;
  notes?: string;
  // New detailed form fields (legacy — kept so old stored records keep typechecking)
  photoUri?: string;
  photoUris?: string[];
  mealCode?: string;
  mealTypeLabel?: string;
  temperature?: string;
  weight?: string;
  container?: string;
  startProcess?: boolean;
  processCode?: string;
  chefName?: string;
  ingredientRows?: IngredientRow[];
  signature?: string;
  // Retention: how long the sample is kept before it's auto-removed.
  retentionHours?: RetentionHours;
  expiresAt?: number; // epoch ms — record is purged once Date.now() passes this
}

interface SamplerContextValue {
  records: SamplerRecord[];
  addRecord: (record: SamplerRecord) => Promise<void>;
  isMealRecordedToday: (mealId: string) => boolean;
  todayRecords: SamplerRecord[];
}

const KEY = '@sampler_records_v1';
/** How often to check for and purge expired samples while the app is open. */
const PURGE_INTERVAL_MS = 60_000;

const SamplerContext = createContext<SamplerContextValue | null>(null);

/** Drops any record whose retention window has passed. */
function purgeExpired(list: SamplerRecord[]): SamplerRecord[] {
  const now = Date.now();
  return list.filter((r) => !r.expiresAt || r.expiresAt > now);
}

export function SamplerProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<SamplerRecord[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((raw) => {
      if (!raw) return;
      const parsed = purgeExpired(JSON.parse(raw));
      setRecords(parsed);
      AsyncStorage.setItem(KEY, JSON.stringify(parsed));
    });
  }, []);

  // Periodically drop samples whose retention window (24h/72h) has elapsed
  // so they automatically disappear from history without needing a restart.
  useEffect(() => {
    const interval = setInterval(() => {
      setRecords((prev) => {
        const purged = purgeExpired(prev);
        if (purged.length !== prev.length) {
          AsyncStorage.setItem(KEY, JSON.stringify(purged));
          return purged;
        }
        return prev;
      });
    }, PURGE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const addRecord = useCallback(async (record: SamplerRecord) => {
    setRecords((prev) => {
      const updated = purgeExpired([...prev, record]);
      AsyncStorage.setItem(KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isMealRecordedToday = useCallback(
    (mealId: string) => {
      const today = localDateISO();
      return records.some((r) => r.mealId === mealId && r.recordedDate === today);
    },
    [records],
  );

  const todayRecords = records.filter((r) => r.recordedDate === localDateISO());

  return (
    <SamplerContext.Provider value={{ records, addRecord, isMealRecordedToday, todayRecords }}>
      {children}
    </SamplerContext.Provider>
  );
}

export function useSampler() {
  const ctx = useContext(SamplerContext);
  if (!ctx) throw new Error('useSampler must be used within SamplerProvider');
  return ctx;
}
