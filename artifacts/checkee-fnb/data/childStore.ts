/**
 * Module-level store for children profiles and the currently selected child.
 * Shared across all tabs so every screen reflects the same active child.
 */

export interface Child {
  id: string;
  name: string;        // short display: "Bé An"
  fullName: string;    // full name: "Nguyễn Minh An"
  className: string;   // "2A"
  grade: string;       // "Lớp 2"
  school: string;
  avatarColor: string; // background colour for avatar circle
  initial: string;     // single letter shown in avatar
}

export const CHILDREN: Child[] = [
  {
    id: 'child_1',
    name: 'Bé An',
    fullName: 'Nguyễn Minh An',
    className: '2A',
    grade: 'Lớp 2',
    school: 'Tiểu học Nguyễn Du',
    avatarColor: '#FF6535',
    initial: 'A',
  },
  {
    id: 'child_2',
    name: 'Bé Bình',
    fullName: 'Nguyễn Minh Bình',
    className: '3B',
    grade: 'Lớp 3',
    school: 'Tiểu học Nguyễn Du',
    avatarColor: '#007AFF',
    initial: 'B',
  },
];

type Listener = () => void;

let _selectedId: string = CHILDREN[0].id;
const _listeners = new Set<Listener>();

export const childStore = {
  getAll: (): Child[] => CHILDREN,
  getSelected: (): Child => CHILDREN.find((c) => c.id === _selectedId) ?? CHILDREN[0],
  select: (id: string): void => {
    _selectedId = id;
    _listeners.forEach((fn) => fn());
  },
  subscribe: (fn: Listener): (() => void) => {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  },
};
