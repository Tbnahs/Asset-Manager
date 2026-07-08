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

export interface SamplerRecord {
  id: string;
  mealId: string;
  mealName: string;
  mealImage: number;
  session: MealSession;
  recordedAt: string;   // 'dd/MM/yyyy HH:mm'
  recordedDate: string; // 'yyyy-MM-dd' for grouping/dedup
  storageLocation: string;
  sampleCount: number;
  notes: string;
  recordedBy: string;
}

interface SamplerContextValue {
  records: SamplerRecord[];
  addRecord: (record: SamplerRecord) => Promise<void>;
  isMealRecordedToday: (mealId: string) => boolean;
  todayRecords: SamplerRecord[];
}

const KEY = '@sampler_records_v1';

const SamplerContext = createContext<SamplerContextValue | null>(null);

export function SamplerProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<SamplerRecord[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((raw) => {
      if (raw) setRecords(JSON.parse(raw));
    });
  }, []);

  const addRecord = useCallback(async (record: SamplerRecord) => {
    setRecords((prev) => {
      const updated = [...prev, record];
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
