import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Text as SvgText } from 'react-native-svg';
import { C } from './ui';

/** MXEX-logga: vit text, svart kontur, tunn vit linje utanför, lätt lutad åt höger. */
export function Logo({ height = 44 }: { height?: number }) {
  const w = height * 3.4;
  const fs = height * 0.82;
  const common = {
    x: height * 0.18,
    y: height * 0.8,
    fontSize: fs,
    fontWeight: '900' as const,
    fontStyle: 'italic' as const,
    fontFamily: 'Arial Black, Arial, Helvetica, sans-serif',
    letterSpacing: height * 0.07,
    strokeLinejoin: 'round' as const,
    transform: `skewX(-12) translate(${height * 0.15} 0)`,
  };
  return (
    <Svg width={w} height={height}>
      <SvgText {...common} fill="#fff" stroke="#fff" strokeWidth={height * 0.22}>MXEX</SvgText>
      <SvgText {...common} fill="#000" stroke="#000" strokeWidth={height * 0.14}>MXEX</SvgText>
      <SvgText {...common} fill="#fff">MXEX</SvgText>
    </Svg>
  );
}

export function Header({ title, onBack }: { title?: string; onBack?: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ backgroundColor: '#000', paddingTop: insets.top + 6, paddingBottom: 8, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: C.line }}>
      {onBack ? (
        <Pressable onPress={onBack} hitSlop={12} style={{ paddingRight: 4 }}>
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </Pressable>
      ) : null}
      <Logo />
      <View style={{ flex: 1 }} />
      {title ? <Text style={{ color: C.dim, fontSize: 16, fontWeight: '700' }}>{title}</Text> : null}
    </View>
  );
}
