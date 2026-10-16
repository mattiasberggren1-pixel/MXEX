import { useState } from 'react';
import { Pressable } from 'react-native';
import { C, Card, Chips, Screen, T } from '../components/ui';
import { SYMPTOMS } from '../logic/troubleshoot';

const ENDS = ['Alla', 'Fram', 'Bak', 'Hela cykeln'] as const;

export default function Troubleshoot() {
  const [end, setEnd] = useState<(typeof ENDS)[number]>('Alla');
  const [open, setOpen] = useState<string | null>(null);
  const list = SYMPTOMS.filter((x) => end === 'Alla' || x.end === end);
  return (
    <Screen>
      <T dim size={14}>Gör en ändring i taget, 2 klick åt gången, och kör samma sträcka igen. Skriv ner vad du ändrat i Loggen.</T>
      <Chips options={ENDS} value={end} onChange={setEnd} />
      {list.map((x) => (
        <Pressable key={x.id} onPress={() => setOpen(open === x.id ? null : x.id)}>
          <Card title={x.title} right={<T color={C.accent}>{open === x.id ? '−' : '+'}</T>}>
            {open === x.id ? x.fixes.map((f, i) => <T key={i}>{i + 1}. {f}</T>) : <T dim size={13}>{x.end}</T>}
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}
