import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export interface Student {
  name: string;
  dob: string;
  studentId: string;
  allergies: string;
  className: string;
  teacher: string;
  room: string;
  classSize: string;
}

export interface UserAccount {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  role: string;
  student: Student;
  school: {
    name: string;
    address: string;
    phone: string;
    foodOfficer: string;
  };
}

const MOCK_ACCOUNTS: Array<UserAccount & { password: string }> = [
  {
    id: '1',
    email: 'huong.nguyen@gmail.com',
    password: '123456',
    name: 'Nguyễn Thị Hương',
    phone: '0912 345 678',
    address: '123 Nguyễn Trãi, Q.5, TP.HCM',
    role: 'Phụ huynh học sinh',
    student: {
      name: 'Nguyễn Minh Khoa',
      dob: '15/03/2019',
      studentId: 'HS2024-00234',
      allergies: 'Không có',
      className: '3A',
      teacher: 'Trần Thị Mai',
      room: 'Phòng 301, Tòa A',
      classSize: '32 học sinh',
    },
    school: {
      name: 'Tiểu học Nguyễn Du',
      address: '45 Nguyễn Du, Q.1, TP.HCM',
      phone: '028 3822 1122',
      foodOfficer: 'Nguyễn Văn Tuấn',
    },
  },
  {
    id: '2',
    email: 'minh.tran@gmail.com',
    password: '123456',
    name: 'Trần Văn Minh',
    phone: '0908 765 432',
    address: '56 Lê Lợi, Q.1, TP.HCM',
    role: 'Phụ huynh học sinh',
    student: {
      name: 'Trần Thị Lan',
      dob: '22/07/2020',
      studentId: 'HS2024-00187',
      allergies: 'Hải sản',
      className: '2B',
      teacher: 'Phạm Thị Thu',
      room: 'Phòng 205, Tòa B',
      classSize: '30 học sinh',
    },
    school: {
      name: 'Tiểu học Nguyễn Du',
      address: '45 Nguyễn Du, Q.1, TP.HCM',
      phone: '028 3822 1122',
      foodOfficer: 'Nguyễn Văn Tuấn',
    },
  },
];

const AUTH_STORAGE_KEY = '@checkee_auth_user';

interface AuthContextValue {
  user: UserAccount | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(AUTH_STORAGE_KEY)
      .then((stored) => {
        if (stored) setUser(JSON.parse(stored));
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const found = MOCK_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password
    );
    if (!found) {
      return { success: false, error: 'Email hoặc mật khẩu không đúng.' };
    }
    const { password: _pw, ...userData } = found;
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
