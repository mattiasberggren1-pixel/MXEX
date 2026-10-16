import { CameraView, useCameraPermissions } from 'expo-camera';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, View } from 'react-native';
import { ECUS } from '../data/ecu';
import { unpack } from '../logic/share';
import { uid, useStore } from '../store';
import { Btn, C, Card, Field, Row, T } from './ui';

export function ImportView({ initial }: { initial?: string }) {
  const { update } = useStore();
  const [text, setText] = useState(initial ?? '');
  const [scan, setScan] = useState(false);
  const [perm, requestPerm] = useCameraPermissions();
  const parsed = text ? unpack(text) : null;

  const save = () => {
    if (!parsed) return;
    const id = uid();
    update((s) => ({ ...s, maps: [{ ...parsed, id, created: Date.now() }, ...s.maps] }));
    router.replace({ pathname: '/map/[id]', params: { id } });
  };

  const pickFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (res.canceled) return;
    const a = res.assets[0];
    const content = Platform.OS === 'web' ? await (await fetch(a.uri)).text() : await new File(a.uri).text();
    setText(content);
  };

  const startScan = async () => {
    if (!perm?.granted) {
      const p = await requestPerm();
      if (!p.granted) return;
    }
    setScan(true);
  };

  return (
    <View style={{ gap: 12 }}>
      <Card title="Hämta mapp">
        <Row wrap>
          <Btn small title={scan ? 'Stoppa kamera' : 'Skanna QR-kod'} onPress={() => (scan ? setScan(false) : startScan())} />
          <Btn small kind="ghost" title="Öppna fil" onPress={pickFile} />
        </Row>
        {scan ? (
          <View style={{ height: 300, borderRadius: 12, overflow: 'hidden' }}>
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={({ data }) => { if (unpack(data)) { setText(data); setScan(false); } }}
            />
          </View>
        ) : null}
        <Field label="…eller klistra in länken du fått" multiline value={text} onChange={setText} placeholder="mxex://map?d=…" />
      </Card>
      {text && !parsed ? <T color={C.bad}>Kunde inte läsa mappen – kontrollera att hela länken kom med.</T> : null}
      {parsed ? (
        <Card title={parsed.name}>
          <T dim>{parsed.model ?? ''}{parsed.author ? ` · av ${parsed.author}` : ''}</T>
          <T>{ECUS[parsed.ecu as keyof typeof ECUS]?.title ?? parsed.ecu}</T>
          {Object.entries(parsed.settings).map(([k, v]) => <T key={k} dim size={14}>{k}: {v}</T>)}
          {parsed.notes ? <T dim size={14}>{parsed.notes}</T> : null}
          <Btn title="Spara i mina mappar" onPress={save} />
        </Card>
      ) : null}
    </View>
  );
}
