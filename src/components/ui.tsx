import { useMemo, useState, type ReactNode } from 'react';
import {
  FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const C = {
  bg: '#0f1115',
  card: '#1a1d24',
  line: '#2a2f3a',
  text: '#f2f3f5',
  dim: '#9aa1ad',
  accent: '#ff6a13',
  good: '#3ccf7a',
  warn: '#ffc53d',
  bad: '#ff5a5a',
  blue: '#4aa3ff',
};

export function Screen({ children }: { children: ReactNode }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 14, paddingBottom: 60, gap: 12 }} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  );
}

export function Card({ title, children, right, style }: { title?: string; children: ReactNode; right?: ReactNode; style?: ViewStyle }) {
  return (
    <View style={[s.card, style]}>
      {title ? (
        <View style={s.row}>
          <Text style={s.cardTitle}>{title}</Text>
          {right}
        </View>
      ) : null}
      {children}
    </View>
  );
}

export function T({ children, dim, size, bold, color, style }: { children: ReactNode; dim?: boolean; size?: number; bold?: boolean; color?: string; style?: object }) {
  return <Text style={[{ color: color ?? (dim ? C.dim : C.text), fontSize: size ?? 15, fontWeight: bold ? '700' : '400', lineHeight: (size ?? 15) * 1.35 }, style]}>{children}</Text>;
}

export function Btn({ title, onPress, kind = 'primary', small }: { title: string; onPress: () => void; kind?: 'primary' | 'ghost' | 'danger'; small?: boolean }) {
  const bg = kind === 'primary' ? C.accent : 'transparent';
  const border = kind === 'danger' ? C.bad : kind === 'ghost' ? C.line : C.accent;
  const color = kind === 'primary' ? '#000' : kind === 'danger' ? C.bad : C.text;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.btn, { backgroundColor: bg, borderColor: border, opacity: pressed ? 0.7 : 1, paddingVertical: small ? 6 : 11 }]}>
      <Text style={{ color, fontWeight: '700', fontSize: small ? 13 : 15 }}>{title}</Text>
    </Pressable>
  );
}

export function Row({ children, gap = 8, wrap }: { children: ReactNode; gap?: number; wrap?: boolean }) {
  return <View style={{ flexDirection: 'row', gap, alignItems: 'center', flexWrap: wrap ? 'wrap' : 'nowrap' }}>{children}</View>;
}

export function Field({ label, value, onChange, placeholder, numeric, multiline }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; numeric?: boolean; multiline?: boolean;
}) {
  return (
    <View style={{ gap: 4, flex: 1 }}>
      <T dim size={13}>{label}</T>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#5c6370"
        keyboardType={numeric ? 'decimal-pad' : 'default'}
        multiline={multiline}
        style={[s.input, multiline && { minHeight: 70, textAlignVertical: 'top' }]}
      />
    </View>
  );
}

/** Tolkar tal med komma eller punkt. */
export const num = (v: string): number | undefined => {
  const n = parseFloat(v.replace(',', '.'));
  return Number.isFinite(n) ? n : undefined;
};
export const str = (n: number | undefined) => (n == null ? '' : String(n).replace('.', ','));

export function Chips<T extends string>({ options, value, onChange, labels }: {
  options: readonly T[]; value: T | undefined; onChange: (v: T) => void; labels?: Record<string, string>;
}) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {options.map((o) => {
        const on = o === value;
        return (
          <Pressable key={o} onPress={() => onChange(o)} style={[s.chip, on && { backgroundColor: C.accent, borderColor: C.accent }]}>
            <Text style={{ color: on ? '#000' : C.text, fontWeight: on ? '700' : '400' }}>{labels?.[o] ?? o}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Väljare med direktsökning – fungerar både som "instant search" och rullista. */
export function Select<V extends string | number>({ label, value, options, onChange, placeholder, searchable = true }: {
  label: string;
  value: V | undefined;
  options: { value: V; label: string; sub?: string }[];
  onChange: (v: V) => void;
  placeholder?: string;
  searchable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const current = options.find((o) => o.value === value);
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return options;
    return options.filter((o) => `${o.label} ${o.sub ?? ''}`.toLowerCase().includes(t));
  }, [q, options]);

  return (
    <View style={{ gap: 4, flex: 1 }}>
      <T dim size={13}>{label}</T>
      <Pressable onPress={() => { setQ(''); setOpen(true); }} style={[s.input, { justifyContent: 'center' }]}>
        <Text style={{ color: current ? C.text : '#5c6370', fontSize: 15 }}>{current?.label ?? placeholder ?? 'Välj…'}</Text>
      </Pressable>
      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
          <View style={{ padding: 14, gap: 10, flex: 1 }}>
            <Row>
              <View style={{ flex: 1 }}><T bold size={18}>{label}</T></View>
              <Btn small kind="ghost" title="Stäng" onPress={() => setOpen(false)} />
            </Row>
            {searchable && (
              <TextInput autoFocus value={q} onChangeText={setQ} placeholder="Sök…" placeholderTextColor="#5c6370" style={s.input} />
            )}
            <FlatList
              data={list}
              keyboardShouldPersistTaps="handled"
              keyExtractor={(o) => String(o.value)}
              renderItem={({ item }) => (
                <Pressable onPress={() => { onChange(item.value); setOpen(false); }} style={({ pressed }) => [s.option, (pressed || item.value === value) && { backgroundColor: C.card }]}>
                  <Text style={{ color: C.text, fontSize: 16 }}>{item.label}</Text>
                  {item.sub ? <Text style={{ color: C.dim, fontSize: 13 }}>{item.sub}</Text> : null}
                </Pressable>
              )}
              ListEmptyComponent={<T dim>Inga träffar.</T>}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

export function Stat({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <View style={s.stat}>
      <T dim size={12}>{label}</T>
      <T bold size={20} color={color}>{value}</T>
      {sub ? <T dim size={12}>{sub}</T> : null}
    </View>
  );
}

export function Stepper({ value, onChange, min, max, step = 1 }: { value: number; onChange: (v: number) => void; min: number; max: number; step?: number }) {
  return (
    <Row gap={4}>
      <Pressable style={s.step} onPress={() => onChange(Math.max(min, value - step))}><Text style={s.stepT}>−</Text></Pressable>
      <Text style={{ color: C.text, minWidth: 34, textAlign: 'center', fontWeight: '700' }}>{value > 0 ? `+${value}` : value}</Text>
      <Pressable style={s.step} onPress={() => onChange(Math.min(max, value + step))}><Text style={s.stepT}>+</Text></Pressable>
    </Row>
  );
}

export const s = StyleSheet.create({
  card: { backgroundColor: C.card, borderRadius: 14, padding: 14, gap: 10, borderWidth: 1, borderColor: C.line },
  cardTitle: { color: C.text, fontSize: 17, fontWeight: '700', flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btn: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  input: { backgroundColor: '#11141a', borderColor: C.line, borderWidth: 1, borderRadius: 10, color: C.text, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, minHeight: 44 },
  chip: { borderWidth: 1, borderColor: C.line, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  option: { paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: C.line },
  stat: { flex: 1, backgroundColor: '#11141a', borderRadius: 10, padding: 10, gap: 2, minWidth: 130 },
  step: { width: 34, height: 34, borderRadius: 8, backgroundColor: '#11141a', borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  stepT: { color: C.text, fontSize: 18, fontWeight: '700' },
});
