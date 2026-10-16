import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Text as SvgText } from 'react-native-svg';
import { C } from './ui';

/** MXEX-logga: vit text, svart kontur och tunn vit linje utanför, lätt lutad. */
export function Logo({ height = 44 }: { height?: number }) {
  const w = height * 3.3;
  const fs = height * 0.82;
  const common = {
    x: w / 2,
    textAnchor: 'middle' as const,
    // Lätt lutning åt höger, samma som app-ikonen.
    transform: `translate(${height * 0.17} 0) skewX(-12)`,
    y: height * 0.8,
    fontSize: fs,
    fontWeight: '900' as const,
    fontFamily: 'Arial Black, Arial, Helvetica, sans-serif',
    letterSpacing: height * 0.07,
    strokeLinejoin: 'round' as const,
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
    <View style={{ backgroundColor: '#000', paddingTop: insets.top + 6, paddingBottom: 6, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: C.line }}>
      {onBack ? (
        <Pressable onPress={onBack} hitSlop={12} style={{ position: 'absolute', left: 10, top: insets.top + 16 }}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </Pressable>
      ) : null}
      <Logo />
      {title ? <Text style={{ color: C.dim, fontSize: 13, fontWeight: '700', marginTop: 2, letterSpacing: 1 }}>{title.toUpperCase()}</Text> : null}
    </View>
  );
}
