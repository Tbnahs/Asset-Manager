import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CHILDREN, childStore } from '@/data/childStore';
import { useColors } from '@/hooks/useColors';
import { useSelectedChild } from '@/hooks/useSelectedChild';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function ChildSelectorModal({ visible, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const selected = useSelectedChild();

  const slideY = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }).start();
    } else {
      slideY.setValue(300);
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 4,
      onPanResponderMove: (_, g) => { if (g.dy > 0) slideY.setValue(g.dy); },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 60 || g.vy > 0.5) {
          Animated.timing(slideY, { toValue: 400, duration: 200, useNativeDriver: true }).start(onClose);
        } else {
          Animated.spring(slideY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  const handleSelect = (id: string) => {
    childStore.select(id);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.sheet,
          { paddingBottom: isWeb ? 20 : insets.bottom + 12, transform: [{ translateY: slideY }] },
        ]}
      >
        {/* Drag handle */}
        <View style={styles.handleArea} {...panResponder.panHandlers}>
          <View style={styles.handle} />
        </View>

        {/* Title */}
        <View style={styles.titleRow} {...panResponder.panHandlers}>
          <Text style={styles.title}>Chọn hồ sơ bé</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Feather name="x" size={17} color="#364153" />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          Tất cả thông tin (thực đơn, phản ánh, thông báo) sẽ hiển thị theo bé được chọn.
        </Text>

        {/* Child list */}
        <View style={styles.list}>
          {CHILDREN.map((child) => {
            const isActive = child.id === selected.id;
            return (
              <TouchableOpacity
                key={child.id}
                onPress={() => handleSelect(child.id)}
                activeOpacity={0.75}
                style={[styles.childRow, isActive && { backgroundColor: child.avatarColor + '10', borderColor: child.avatarColor }]}
              >
                {/* Avatar */}
                <View style={[styles.avatar, { backgroundColor: child.avatarColor + '20', borderColor: child.avatarColor }]}>
                  <Text style={[styles.avatarText, { color: child.avatarColor }]}>{child.initial}</Text>
                </View>

                {/* Info */}
                <View style={styles.childInfo}>
                  <Text style={styles.childName}>{child.fullName}</Text>
                  <View style={styles.childMeta}>
                    <View style={[styles.classBadge, { backgroundColor: child.avatarColor + '18' }]}>
                      <Text style={[styles.classText, { color: child.avatarColor }]}>
                        {child.grade} · {child.className}
                      </Text>
                    </View>
                    <Text style={styles.schoolText} numberOfLines={1}>{child.school}</Text>
                  </View>
                </View>

                {/* Check */}
                {isActive ? (
                  <View style={[styles.checkCircle, { backgroundColor: child.avatarColor }]}>
                    <Feather name="check" size={14} color="#fff" />
                  </View>
                ) : (
                  <View style={[styles.emptyCircle, { borderColor: '#D1D5DC' }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.48)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 24,
  },
  handleArea: { paddingVertical: 10, alignItems: 'center' },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#C8CBD0' },
  titleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 4,
  },
  title: { fontSize: 17, fontFamily: 'Inter_700Bold', color: '#1C1C1E' },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#F2F3F7',
    alignItems: 'center', justifyContent: 'center',
  },
  subtitle: {
    fontSize: 13, fontFamily: 'Inter_400Regular', color: '#8E8E93',
    lineHeight: 18, paddingHorizontal: 20, paddingBottom: 16,
  },
  list: { paddingHorizontal: 16, gap: 10, paddingBottom: 8 },
  childRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 14, borderRadius: 16,
    borderWidth: 1.5, borderColor: '#EBEBEF',
    backgroundColor: '#FAFAFA',
  },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  childInfo: { flex: 1, gap: 6 },
  childName: { fontSize: 15, fontFamily: 'Inter_700Bold', color: '#1C1C1E' },
  childMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  classBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  classText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  schoolText: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#8E8E93', flexShrink: 1 },
  checkCircle: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  emptyCircle: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 1.5, flexShrink: 0,
  },
});
