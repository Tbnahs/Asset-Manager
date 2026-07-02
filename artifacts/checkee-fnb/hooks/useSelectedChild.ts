import { useEffect, useState } from 'react';
import { childStore, Child } from '@/data/childStore';

/** Reactive hook — re-renders whenever the selected child changes. */
export function useSelectedChild(): Child {
  const [child, setChild] = useState<Child>(() => childStore.getSelected());
  useEffect(() => childStore.subscribe(() => setChild(childStore.getSelected())), []);
  return child;
}
