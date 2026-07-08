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

const MOCK_SAMPLER_ACCOUNT: UserAccount & { password: string } = {
  id: '2',
  phone: '0912000000',
  password: '123456',
  name: 'Trần Thị Mai',
  email: 'mai.tran@ischool.edu.vn',
  address: 'Tiểu học Nguyễn Du, Q.1, TP.HCM',
  role: 'Người lưu mẫu',
  children: [],
  schoolInfo: {
    name: 'Tiểu học Nguyễn Du',
    address: '45 Nguyễn Du, Q.1, TP.HCM',
    phone: '028 3822 1122',
    foodOfficer: 'Nguyễn Văn Tuấn',
  },
};

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
const PASSWORD_STORAGE_KEY = '@checkee_auth_password';
const SAMPLER_PASSWORD_STORAGE_KEY = '@checkee_sampler_password';

// Normalize phone: strip spaces, dashes, etc.
function normalizePhone(raw: string) {
  return raw.replace(/\D/g, '');
}

interface AuthContextValue {
  user: UserAccount | null;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<UserAccount>) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  requestPasswordResetOtp: (phone: string) => Promise<{ success: boolean; error?: string; otp?: string }>;
  resetPasswordWithOtp: (phone: string, otp: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [parentPassword, setParentPassword] = useState(MOCK_ACCOUNT.password);
  const [samplerPassword, setSamplerPassword] = useState(MOCK_SAMPLER_ACCOUNT.password);
  const [pendingOtp, setPendingOtp] = useState<{ phone: string; code: string } | null>(null);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(AUTH_STORAGE_KEY),
      AsyncStorage.getItem(PASSWORD_STORAGE_KEY),
      AsyncStorage.getItem(SAMPLER_PASSWORD_STORAGE_KEY),
    ])
      .then(([storedUser, storedPassword, storedSamplerPassword]) => {
        if (storedUser) setUser(JSON.parse(storedUser));
        if (storedPassword) setParentPassword(storedPassword);
        if (storedSamplerPassword) setSamplerPassword(storedSamplerPassword);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (phone: string, password: string) => {
    const inputPhone = normalizePhone(phone);

    // Sampler account
    if (inputPhone === normalizePhone(MOCK_SAMPLER_ACCOUNT.phone)) {
      if (password !== samplerPassword) {
        return { success: false, error: 'Số điện thoại hoặc mật khẩu không đúng.' };
      }
      const { password: _pw, ...userData } = MOCK_SAMPLER_ACCOUNT;
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    }

    // Parent account
    if (inputPhone === normalizePhone(MOCK_ACCOUNT.phone)) {
      if (password !== parentPassword) {
        return { success: false, error: 'Số điện thoại hoặc mật khẩu không đúng.' };
      }
      const { password: _pw, ...userData } = MOCK_ACCOUNT;
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    }

    return { success: false, error: 'Số điện thoại hoặc mật khẩu không đúng.' };
  }, [parentPassword, samplerPassword]);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  }, []);

  const updateUser = useCallback(async (updates: Partial<UserAccount>) => {
    if (!user) return { success: false, error: 'Chưa đăng nhập.' };

    const updated = { ...user, ...updates };
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
    setUser(updated);

    // Keep the mock account records in sync so login still works after edits
    if (user.id === MOCK_ACCOUNT.id) Object.assign(MOCK_ACCOUNT, updates);
    if (user.id === MOCK_SAMPLER_ACCOUNT.id) Object.assign(MOCK_SAMPLER_ACCOUNT, updates);

    return { success: true };
  }, [user]);

  const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    if (!user) return { success: false, error: 'Chưa đăng nhập.' };

    const isSampler = user.id === MOCK_SAMPLER_ACCOUNT.id;
    const expected = isSampler ? samplerPassword : parentPassword;

    if (oldPassword !== expected) {
      return { success: false, error: 'Mật khẩu hiện tại không đúng.' };
    }
    if (newPassword.length < 6) {
      return { success: false, error: 'Mật khẩu mới phải có ít nhất 6 ký tự.' };
    }
    if (newPassword === oldPassword) {
      return { success: false, error: 'Mật khẩu mới phải khác mật khẩu hiện tại.' };
    }

    const key = isSampler ? SAMPLER_PASSWORD_STORAGE_KEY : PASSWORD_STORAGE_KEY;
    await AsyncStorage.setItem(key, newPassword);
    if (isSampler) setSamplerPassword(newPassword);
    else setParentPassword(newPassword);

    return { success: true };
  }, [user, parentPassword, samplerPassword]);

  const requestPasswordResetOtp = useCallback(async (phone: string) => {
    const inputPhone = normalizePhone(phone);
    const accountPhone = normalizePhone(MOCK_ACCOUNT.phone);
    if (inputPhone !== accountPhone) {
      return { success: false, error: 'Số điện thoại này chưa được đăng ký.' };
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setPendingOtp({ phone: inputPhone, code });
    // Demo only: in production this code would be sent via an SMS gateway, not returned to the client.
    return { success: true, otp: code };
  }, []);

  const resetPasswordWithOtp = useCallback(async (phone: string, otp: string, newPassword: string) => {
    const inputPhone = normalizePhone(phone);
    if (!pendingOtp || pendingOtp.phone !== inputPhone) {
      return { success: false, error: 'Vui lòng lấy mã OTP mới.' };
    }
    if (otp.trim() !== pendingOtp.code) {
      return { success: false, error: 'Mã OTP không đúng.' };
    }
    if (newPassword.length < 6) {
      return { success: false, error: 'Mật khẩu mới phải có ít nhất 6 ký tự.' };
    }
    await AsyncStorage.setItem(PASSWORD_STORAGE_KEY, newPassword);
    setParentPassword(newPassword);
    setPendingOtp(null);
    return { success: true };
  }, [pendingOtp]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        updateUser,
        changePassword,
        requestPasswordResetOtp,
        resetPasswordWithOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
