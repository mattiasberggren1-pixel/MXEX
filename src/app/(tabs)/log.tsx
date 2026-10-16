import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Btn, C, Card, Chips, Field, Row, Screen, Stat, T } from '../../components/ui';
import { findModel } from '../../data/bikes';
import { TERRAINS } from '../../logic/suspension';
import { uid, useActiveBike, useStore, type SessionLog } from '../../store';

const TABS = ['Pass', 'Varvtid'] as const;

export default function Log() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Pass');
  return (
    <Screen>
      <Chips options={TABS} value={tab} onChange={setTab} />
      {tab === 'Pass' ? <Sessions /> : <LapTimer />}
    </Screen>
  );
}

function Sessions() {
  const { state, update } = useStore();
  const bike = useActiveBike();
  const [open, setOpen] = useState<string | null>(null);
  const setLog = (id: string, p: Partial<SessionLog>) => update((s) => ({ ...s, logs: s.logs.map((l) => (l.id === id ? { ...l, ...p } : l)) }));
  const add = () => {
    const id = uid();
    update((s) => ({ ...s, logs: [{ id, bikeId: bike?.id, date: Date.now(), track: '', terrain: 'blandat', setup: '', rating: 3, notes: '' }, ...s.logs] }));
    setOpen(id);
  };
  return (
    <>
      <Btn title="+ Nytt pass" onPress={add} />
      {state.logs.length === 0 ? <T dim>Spara inställningar från Fjädring-fliken eller lägg till ett pass här. Då ser du vad som funkade på varje bana.</T> : null}
      {state.logs.map((l) => {
        const b = state.bikes.find((x) => x.id === l.bikeId);
        const m = b ? findModel(b.modelId) : undefined;
        const isOpen = open === l.id;
        return (
          <Pressable key={l.id} onPress={() => setOpen(isOpen ? null : l.id)}>
            <Card title={`${new Date(l.date).toLocaleDateString('sv-SE')} ${l.track || 'Okänd bana'}`} right={<T color={C.warn}>{'★'.repeat(l.rating)}</T>}>
              <T dim size={13}>{m ? `${m.name} · ` : ''}{TERRAINS.find((t) => t.id === l.terrain)?.label}</T>
              {isOpen ? (
                <View style={{ gap: 8 }}>
                  <Field label="Bana" value={l.track} onChange={(v) => setLog(l.id, { track: v })} />
                  <Chips options={TERRAINS.map((t) => t.id)} labels={Object.fromEntries(TERRAINS.map((t) => [t.id, t.label]))} value={l.terrain} onChange={(v) => setLog(l.id, { terrain: v })} />
                  <Field label="Inställning" multiline value={l.setup} onChange={(v) => setLog(l.id, { setup: v })} />
                  <Field label="Känsla / anteckningar" multiline value={l.notes} onChange={(v) => setLog(l.id, { notes: v })} />
                  <T dim size={13}>Betyg</T>
                  <Chips options={['1', '2', '3', '4', '5']} value={String(l.rating)} onChange={(v) => setLog(l.id, { rating: Number(v) })} />
                  <Btn small kind="danger" title="Ta bort" onPress={() => update((s) => ({ ...s, logs: s.logs.filter((x) => x.id !== l.id) }))} />
                </View>
              ) : l.setup ? <T size={13}>{l.setup.split('\n').slice(0, 2).join(' · ')}</T> : null}
            </Card>
          </Pressable>
        );
      })}
    </>
  );
}

const fmt = (ms: number) => {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const h = Math.floor((ms % 1000) / 100);
  return `${m}:${String(s).padStart(2, '0')}.${h}`;
};

function LapTimer() {
  const { update } = useStore();
  const bike = useActiveBike();
  const [start, setStart] = useState<number | null>(null);
  const [lapStart, setLapStart] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const [now, setNow] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (start != null) timer.current = setInterval(() => setNow(Date.now()), 100);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [start]);

  const best = laps.length ? Math.min(...laps) : 0;
  const saveSession = () => {
    if (!laps.length) return;
    update((s) => ({
      ...s,
      logs: [{ id: uid(), bikeId: bike?.id, date: Date.now(), track: '', terrain: 'blandat', setup: '', rating: 3, notes: `Varvtider: ${laps.map(fmt).join(', ')}\nBästa: ${fmt(best)}` }, ...s.logs],
    }));
    setLaps([]); setStart(null);
  };

  return (
    <>
      <Card>
        <Text style={{ color: C.text, fontSize: 56, fontWeight: '800', textAlign: 'center', fontVariant: ['tabular-nums'] }}>
          {start != null ? fmt(now - lapStart) : '0:00.0'}
        </Text>
        <Row>
          <Stat label="Varv" value={String(laps.length)} />
          <Stat label="Bästa" value={best ? fmt(best) : '–'} color={C.good} />
        </Row>
        {start == null ? (
          <Btn title="Start" onPress={() => { const t = Date.now(); setStart(t); setLapStart(t); setNow(t); }} />
        ) : (
          <Pressable onPress={() => { const t = Date.now(); setLaps((l) => [...l, t - lapStart]); setLapStart(t); }} style={{ backgroundColor: C.accent, borderRadius: 14, paddingVertical: 40, alignItems: 'center' }}>
            <Text style={{ fontSize: 28, fontWeight: '800' }}>VARV</Text>
          </Pressable>
        )}
        {start != null ? <Btn kind="ghost" title="Stopp" onPress={() => setStart(null)} /> : null}
      </Card>
      {laps.map((l, i) => (
        <Row key={i}>
          <T dim style={{ flex: 1 }}>Varv {i + 1}</T>
          <T bold color={l === best ? C.good : C.text}>{fmt(l)}</T>
        </Row>
      ))}
      {laps.length > 0 && start == null ? <Btn title="Spara som pass i loggen" onPress={saveSession} /> : null}
    </>
  );
}
