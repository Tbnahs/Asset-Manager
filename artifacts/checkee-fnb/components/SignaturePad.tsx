import React, { useMemo, useRef, useState } from 'react';
import { GestureResponderEvent, PanResponder, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type Props = {
  value: string;
  onChange: (value: string) => void;
  strokeColor?: string;
  height?: number;
};

export default function SignaturePad({ value, onChange, strokeColor = '#1F2937', height = 140 }: Props) {
  const paths = useMemo(() => (value ? value.split('|').filter(Boolean) : []), [value]);
  const [currentPath, setCurrentPath] = useState('');
  const pathsRef = useRef<string[]>(paths);
  pathsRef.current = paths;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath(`M${locationX.toFixed(1)},${locationY.toFixed(1)}`);
      },
      onPanResponderMove: (evt: GestureResponderEvent) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath((prev) => `${prev} L${locationX.toFixed(1)},${locationY.toFixed(1)}`);
      },
      onPanResponderRelease: () => {
        setCurrentPath((prev) => {
          if (prev) {
            const next = [...pathsRef.current, prev];
            onChange(next.join('|'));
          }
          return '';
        });
      },
      onPanResponderTerminate: () => {
        setCurrentPath('');
      },
    }),
  ).current;

  return (
    <View style={[styles.pad, { height }]} {...panResponder.panHandlers}>
      <Svg style={StyleSheet.absoluteFill}>
        {paths.map((d, i) => (
          <Path key={i} d={d} stroke={strokeColor} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {currentPath ? (
          <Path d={currentPath} stroke={strokeColor} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ) : null}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: {
    width: '100%',
  },
});
