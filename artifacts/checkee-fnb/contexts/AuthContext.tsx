import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

export interface StudentDetail {
  childId: string;
  fullName: string;
  dob: string;
  studentId: string;
  allergies: string;
  className: string;
  grade: string;
  teacher: string;
  room: string;
  classSize: string;
  school: string;
}

export interface UserAccount {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  role: string;
  children: StudentDetail[];
  schoolInfo: {
    name: string;
    address: string;
    phone: string;
    foodOfficer: string;
  };
}

const MOCK_ACCOUNT: UserAccount & { password: string } = {
  id: '1',
  phone: '0912345678',
  password: '123456',
  name: 'Nguyễn Thị Hương',
  email: 'huong.nguyen@gmail.com',
  address: '123 Nguyễn Trãi, Q.5, TP.HCM',
  role: 'Phụ huynh học sinh',
  children: [
    {
      childId: 'child_1',
      fullName: 'Nguyễn Minh An',
      dob: '10/05/2018',
      studentId: 'HS2024-00221',
      allergies: 'Không có',
      className: '2A',
      grade: 'Lớp 2',
      teacher: 'Nguyễn Thị Lan',
      room: 'Phòng 201, Tòa A',
      classSize: '30 học sinh',
      school: 'Tiểu học Nguyễn Du',
    },
    {
      childId: 'child_2',
      fullName: 'Nguyễn Minh Bình',
      dob: '22/11/2016',
      studentId: 'HS2024-00189',
      allergies: 'Hải sản',
      className: '3B',
      grade: 'Lớp 3',
      teacher: 'Trần Văn Hùng',
      room: 'Phòng 305, Tòa B',
      classSize: '32 học sinh',
      school: 'Tiểu học Nguyễn Du',
    },
  ],
  schoolInfo: {
    name: 'Tiểu học Nguyễn Du',
    address: '45 Nguyễn Du, Q.1, TP.HCM',
    phone: '028 3822 1122',
    foodOfficer: 'Nguyễn Văn Tuấn',
  },
};

const AUTH_STORAGE_KEY = '@checkee_auth_user';

// Normalize phone: strip spaces, dashes, etc.
function normalizePhone(raw: string) {
  return raw.replace(/\D/g, '');
}

interface AuthContextValue {
  user: UserAccount | null;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(AUTH_STORAGE_KEY)
      .then((stored) => {
        if (stored) {
          setUser(JSON.parse(stored));
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (phone: string, password: string) => {
    const inputPhone = normalizePhone(phone);
    const accountPhone = normalizePhone(MOCK_ACCOUNT.phone);
    if (inputPhone !== accountPhone || password !== MOCK_ACCOUNT.password) {
      return { success: false, error: 'Số điện thoại hoặc mật khẩu không đúng.' };
    }
    const { password: _pw, ...userData } = MOCK_ACCOUNT;
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
