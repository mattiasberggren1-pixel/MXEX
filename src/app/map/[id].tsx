import * as Clipboard from 'expo-clipboard';
import { File, Paths } from 'expo-file-system';
import { router, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Alert, Platform, Pressable, Share, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Btn, C, Card, Chips, Field, Row, Screen, T } from '../../components/ui';
import { findModel, genFor, type EcuId } from '../../data/bikes';
import { ECUS, PRESETS, type Grid } from '../../data/ecu';
import { pack, toLink } from '../../logic/share';
import { uid, useActiveBike, useStore, type EngineMap } from '../../store';

const zeros = (g: Grid) => Array.from({ length: g.rows }, () => Array(g.cols).fill(0));

export default function MapEditor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, update } = useStore();
  const bike = useActiveBike();
  const existing = state.maps.find((m) => m.id === id);

  const [map, setMap] = useState<EngineMap>(() => {
    if (existing) return existing;
    const model = bike ? findModel(bike.modelId) : undefined;
    const ecu: EcuId = model && bike ? genFor(model, bike.year).ecu : 'generic-efi';
    const g = ECUS[ecu].grid;
    return {
      id: uid(), name: '', bikeId: bike?.id, ecu,
      model: model && bike ? `${model.brand} ${model.name} ${bike.year}` : undefined,
      fuel: g ? zeros(g) : undefined, ign: g ? zeros(g) : undefined,
      settings: {}, notes: '', created: Date.now(), author: state.rider.name || undefined,
    };
  });
  const [layer, setLayer] = useState<'Bränsle' | 'Tändning'>('Bränsle');
  const [sel, setSel] = useState<[number, number]>([0, 0]);
  const [showShare, setShowShare] = useState(false);

  const ecu = ECUS[map.ecu as EcuId] ?? ECUS['generic-efi'];
  const grid = ecu.grid;
  const set = (p: Partial<EngineMap>) => setMap((m) => ({ ...m, ...p }));

  const cells = layer === 'Bränsle' ? map.fuel : map.ign;
  const range = grid ? (layer === 'Bränsle' ? grid.fuelRange : grid.ignRange) : [0, 0];
  const bump = (d: number) => {
    if (!cells) return;
    const [r, c] = sel;
    const next = cells.map((row) => [...row]);
    next[r][c] = Math.max(range[0], Math.min(range[1], next[r][c] + d));
    set(layer === 'Bränsle' ? { fuel: next } : { ign: next });
  };

  const save = () => {
    const m = { ...map, name: map.name.trim() || 'Namnlös mapp' };
    update((s) => ({ ...s, maps: existing ? s.maps.map((x) => (x.id === m.id ? m : x)) : [m, ...s.maps] }));
    setMap(m);
    return m;
  };

  const shareLink = async () => {
    const m = save();
    await Share.share({ message: `DialedMX-mapp "${m.name}" (${m.model ?? ''}). Öppna i DialedMX → Motor → Importera:\n${toLink(m)}` });
  };

  const shareFile = async () => {
    const m = save();
    if (Platform.OS === 'web') {
      const blob = new Blob([pack(m)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${m.name.replace(/[^\wåäöÅÄÖ-]+/g, '_')}.dialedmx`;
      a.click();
      return;
    }
    const f = new File(Paths.cache, `${m.name.replace(/[^\w-]+/g, '_')}.dialedmx`);
    await f.write(pack(m));
    await Sharing.shareAsync(f.uri, { mimeType: 'application/json', dialogTitle: 'Dela mapp' });
  };

  const remove = () => {
    const doIt = () => { update((s) => ({ ...s, maps: s.maps.filter((x) => x.id !== map.id) })); router.back(); };
    if (Platform.OS === 'web') { if (window.confirm('Ta bort mappen?')) doIt(); }
    else Alert.alert('Ta bort mappen?', '', [{ text: 'Avbryt' }, { text: 'Ta bort', style: 'destructive', onPress: doIt }]);
  };

  return (
    <Screen>
      <Card title={ecu.title}>
        {map.model ? <T dim size={13}>{map.model}{map.author ? ` · av ${map.author}` : ''}</T> : null}
        <Field label="Namn" value={map.name} onChange={(v) => set({ name: v })} placeholder="t.ex. Sand Uddevalla" />
      </Card>

      {ecu.fields.length > 0 ? (
        <Card title="Inställningar">
          {ecu.fields.map((f) => (
            <View key={f.key} style={{ gap: 6 }}>
              {f.options.length ? (
                <>
                  <T dim size={13}>{f.label}</T>
                  <Chips options={f.options} value={map.settings[f.key]} onChange={(v) => set({ settings: { ...map.settings, [f.key]: v } })} />
                </>
              ) : (
                <Field label={f.label} value={map.settings[f.key] ?? ''} onChange={(v) => set({ settings: { ...map.settings, [f.key]: v } })} />
              )}
            </View>
          ))}
        </Card>
      ) : null}

      {grid && cells ? (
        <Card title="Karta">
          <Chips options={['Bränsle', 'Tändning'] as const} value={layer} onChange={setLayer} />
          <T dim size={12}>Rader = gasöppning, kolumner = varvtal – samma uppställning som i tillverkarens app. 0 = standard. {layer === 'Bränsle' ? `Enhet: ${grid.fuelUnit}` : `Enhet: ${grid.ignUnit}`}</T>
          <View style={{ gap: 4 }}>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              <View style={{ width: 66 }} />
              {grid.colLabels.map((l) => <Text key={l} style={{ flex: 1, color: C.dim, fontSize: 11, textAlign: 'center' }}>{l}</Text>)}
            </View>
            {cells.map((row, r) => (
              <View key={r} style={{ flexDirection: 'row', gap: 4 }}>
                <Text style={{ width: 66, color: C.dim, fontSize: 11, alignSelf: 'center' }}>{grid.rowLabels[r]}</Text>
                {row.map((v, c) => {
                  const on = sel[0] === r && sel[1] === c;
                  return (
                    <Pressable key={c} onPress={() => setSel([r, c])} style={{ flex: 1, height: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: heat(v, range[1]), borderWidth: on ? 2 : 0, borderColor: '#fff' }}>
                      <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>{v > 0 ? `+${v}` : v}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
          <Row>
            <Btn title="−1" kind="ghost" onPress={() => bump(-1)} />
            <View style={{ flex: 1 }}>
              <T dim size={12} style={{ textAlign: 'center' }}>{grid.rowLabels[sel[0]]} · {grid.colLabels[sel[1]]}</T>
            </View>
            <Btn title="+1" kind="ghost" onPress={() => bump(1)} />
          </Row>
          {grid.rows === 4 ? (
            <>
              <T dim size={13}>Utgångspunkter (DialedMX egna förslag, inte tillverkarens):</T>
              <Row wrap>
                {PRESETS.map((p) => <Btn key={p.name} small kind="ghost" title={p.name} onPress={() => set({ fuel: p.fuel.map((x) => [...x]), ign: p.ign.map((x) => [...x]), notes: map.notes || p.note })} />)}
              </Row>
            </>
          ) : null}
          <T dim size={12}>Ändra 1–2 steg i taget och provkör. Mer tändning ger mer kraft men kan ge spikning – lyssna på motorn.</T>
        </Card>
      ) : null}

      <Card title="Anteckningar">
        <Field label="Bana, väder, känsla…" multiline value={map.notes} onChange={(v) => set({ notes: v })} />
      </Card>

      <Btn title="Spara" onPress={() => { save(); router.back(); }} />

      <Card title="Dela">
        <Row wrap>
          <Btn small title={showShare ? 'Dölj QR-kod' : 'Visa QR-kod'} onPress={() => { save(); setShowShare(!showShare); }} />
          <Btn small kind="ghost" title="Dela länk" onPress={shareLink} />
          <Btn small kind="ghost" title="Spara/dela fil" onPress={shareFile} />
          <Btn small kind="ghost" title="Kopiera" onPress={() => Clipboard.setStringAsync(toLink(save()))} />
        </Row>
        {showShare ? (
          <View style={{ alignItems: 'center', padding: 12, backgroundColor: '#fff', borderRadius: 12 }}>
            <QRCode value={toLink(map)} size={240} ecl="L" />
            <Text style={{ marginTop: 8, color: '#000' }}>Skanna i DialedMX → Motor → Importera</Text>
          </View>
        ) : null}
      </Card>

      {existing ? <Btn kind="danger" title="Ta bort mapp" onPress={remove} /> : null}
    </Screen>
  );
}

function heat(v: number, max: number) {
  if (v === 0) return '#2a2f3a';
  const a = Math.min(1, Math.abs(v) / Math.max(4, max / 2));
  return v > 0 ? `rgba(255,106,19,${0.35 + a * 0.65})` : `rgba(74,163,255,${0.35 + a * 0.65})`;
}
