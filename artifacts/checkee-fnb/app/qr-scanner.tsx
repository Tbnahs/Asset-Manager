import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/AuthContext';
import { useSampler } from '@/contexts/SamplerContext';
import { MEALS } from '@/data/mockData';
import { useColors } from '@/hooks/useColors';

function todayDayIndex(): number | null {
  const dow = new Date().getDay(); // 0 Sun … 6 Sat
  if (dow === 0 || dow === 6) return null;
  return dow - 1; // Mon=0 … Fri=4
}

export default function QrScannerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const { user } = useAuth();
  const { isMealRecordedToday } = useSampler();

  // Role guard
  React.useEffect(() => {
    if (user && user.role !== 'Người lưu mẫu') {
      router.replace('/(tabs)');
    }
  }, [user]);

  // The QR code on the tray identifies the meal — simulated here by picking
  // the next un-recorded meal from today's menu once a scan "detects" it.
  const dayIndex = todayDayIndex();
  const todayMeals = dayIndex === null ? [] : MEALS.filter((m) => m.dayIndex === dayIndex);
  const pendingMeals = todayMeals.filter((m) => !isMealRecordedToday(m.id));

  const [detectedMealId, setDetectedMealId] = useState<string | null>(null);
  const meal = MEALS.find((m) => m.id === detectedMealId);

  // Phases: idle → scanning → detected
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'detected'>('idle');

  // Animated scanning line
  const scanLineY = useRef(new Animated.Value(0)).current;
  const scanLoop  = useRef<Animated.CompositeAnimation | null>(null);

  const startScanLine = () => {
    scanLineY.setValue(0);
    scanLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineY, { toValue: 1, duration: 1800, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(scanLineY, { toValue: 0, duration: 1800, easing: Easing.linear, useNativeDriver: true }),
      ]),
    );
    scanLoop.current.start();
  };

  const stopScanLine = () => {
    scanLoop.current?.stop();
  };

  useEffect(() => {
    if (phase === 'scanning') {
      startScanLine();
      // Simulate reading the QR code on the tray after 2.2s and identifying
      // which meal it belongs to (the next un-recorded meal for today).
      const t = setTimeout(() => {
        stopScanLine();
        setDetectedMealId(pendingMeals[0]?.id ?? null);
        setPhase('detected');
      }, 2200);
      return () => clearTimeout(t);
    }
    stopScanLine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const handleProceed = () => {
    if (meal && phase === 'detected') {
      router.replace(`/scan-sample/${meal.id}` as any);
    }
  };

  // ── Render ──
  return (
    <View style={[styles.root, { backgroundColor: '#0A0A0A' }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: isWeb ? 67 : insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quét mã QR</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Camera frame area */}
      <View style={styles.frameArea}>
        {/* Dark overlay - top */}
        <View style={[styles.overlay, { top: 0, left: 0, right: 0, height: '20%' }]} />
        {/* Dark overlay - bottom */}
        <View style={[styles.overlay, { bottom: 0, left: 0, right: 0, height: '20%' }]} />
        {/* Dark overlay - left */}
        <View style={[styles.overlay, { top: '20%', left: 0, width: '10%', height: '60%' }]} />
        {/* Dark overlay - right */}
        <View style={[styles.overlay, { top: '20%', right: 0, width: '10%', height: '60%' }]} />

        {/* Viewfinder box */}
        <View style={styles.viewfinder}>
          {/* Corner markers */}
          <View style={[styles.corner, styles.cornerTL, { borderColor: phase === 'detected' ? '#22C55E' : '#FF6B00' }]} />
          <View style={[styles.corner, styles.cornerTR, { borderColor: phase === 'detected' ? '#22C55E' : '#FF6B00' }]} />
          <View style={[styles.corner, styles.cornerBL, { borderColor: phase === 'detected' ? '#22C55E' : '#FF6B00' }]} />
          <View style={[styles.corner, styles.cornerBR, { borderColor: phase === 'detected' ? '#22C55E' : '#FF6B00' }]} />

          {/* Scan line */}
          {phase === 'scanning' && (
            <Animated.View
              style={[
                styles.scanLine,
                {
                  transform: [{
                    translateY: scanLineY.interpolate({ inputRange: [0, 1], outputRange: [0, 220] }),
                  }],
                },
              ]}
            />
          )}

          {/* Detected state */}
          {phase === 'detected' && (
            <View style={styles.detectedOverlay}>
              <Feather name="check-circle" size={52} color="#22C55E" />
              <Text style={styles.detectedText}>Nhận diện thành công!</Text>
            </View>
          )}

          {/* Idle QR icon */}
          {phase === 'idle' && (
            <View style={styles.idleIcon}>
              <Feather name="maximize" size={52} color="rgba(255,255,255,0.3)" />
            </View>
          )}
        </View>

        {/* Hint */}
        {phase === 'idle' && (
          <Text style={styles.hint}>
            Đặt mã QR dán trên khay cơm vào khung hình
          </Text>
        )}
        {phase === 'scanning' && (
          <Text style={styles.hint}>Đang quét...</Text>
        )}
        {phase === 'detected' && meal && (
          <Text style={[styles.hint, { color: '#22C55E' }]}>
            Đã nhận diện: <Text style={{ fontWeight: '700' }}>{meal.name}</Text>
          </Text>
        )}
        {phase === 'detected' && !meal && (
          <Text style={[styles.hint, { color: '#22C55E' }]}>
            Tất cả món ăn hôm nay đã được lưu mẫu.
          </Text>
        )}
      </View>

      {/* Bottom panel */}
      <View style={[styles.bottomPanel, { paddingBottom: isWeb ? 40 : insets.bottom + 24 }]}>
        {phase === 'idle' && (
          <View style={styles.mealPill}>
            <Feather name="info" size={13} color="rgba(255,255,255,0.6)" />
            <Text style={styles.mealPillText} numberOfLines={1}>
              Tìm mã QR dán trên khay cơm cần lưu mẫu
            </Text>
          </View>
        )}

        {phase !== 'detected' ? (
          <TouchableOpacity
            style={[styles.scanBtn, phase === 'scanning' && styles.scanBtnActive]}
            onPress={() => setPhase(phase === 'idle' ? 'scanning' : 'idle')}
            activeOpacity={0.85}
          >
            {phase === 'scanning' ? (
              <>
                <Feather name="x" size={18} color="#fff" />
                <Text style={styles.scanBtnText}>Huỷ quét</Text>
              </>
            ) : (
              <>
                <Feather name="camera" size={18} color="#fff" />
                <Text style={styles.scanBtnText}>Bắt đầu quét</Text>
              </>
            )}
          </TouchableOpacity>
        ) : meal ? (
          <TouchableOpacity
            style={[styles.scanBtn, { backgroundColor: '#22C55E' }]}
            onPress={handleProceed}
            activeOpacity={0.85}
          >
            <Feather name="arrow-right" size={18} color="#fff" />
            <Text style={styles.scanBtnText}>Tiếp tục điền thông tin</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.scanBtn, { backgroundColor: '#22C55E' }]}
            onPress={() => router.replace('/(sampler-tabs)' as any)}
            activeOpacity={0.85}
          >
            <Feather name="check" size={18} color="#fff" />
            <Text style={styles.scanBtnText}>Quay lại thực đơn</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12, zIndex: 10,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#fff', fontFamily: 'Inter_600SemiBold' },

  frameArea: { flex: 1, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  overlay: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.72)' },

  viewfinder: {
    width: 240, height: 240,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },

  /* Corner markers */
  corner: { position: 'absolute', width: 32, height: 32, borderWidth: 3 },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },

  scanLine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 2,
    backgroundColor: '#FF6B00',
    shadowColor: '#FF6B00', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 6,
    elevation: 4,
  },

  detectedOverlay: { alignItems: 'center', gap: 10 },
  detectedText: { color: '#22C55E', fontSize: 14, fontFamily: 'Inter_600SemiBold', fontWeight: '600' },

  idleIcon: { opacity: 0.3 },

  hint: {
    color: 'rgba(255,255,255,0.75)', fontSize: 13,
    fontFamily: 'Inter_400Regular', textAlign: 'center',
    marginTop: 20, paddingHorizontal: 32,
  },

  bottomPanel: { paddingHorizontal: 20, paddingTop: 20, gap: 12, alignItems: 'center' },

  mealPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    maxWidth: '90%',
  },
  mealPillText: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontFamily: 'Inter_400Regular', flexShrink: 1 },

  scanBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FF6B00', height: 52, borderRadius: 16,
    paddingHorizontal: 32, width: '100%', justifyContent: 'center',
  },
  scanBtnActive: { backgroundColor: '#666' },
  scanBtnText: { color: '#fff', fontSize: 15, fontFamily: 'Inter_600SemiBold', fontWeight: '600' },
});
