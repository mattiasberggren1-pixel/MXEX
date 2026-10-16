import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Btn, C, Card, Row, Screen, T } from '../../components/ui';
import { findModel, genFor } from '../../data/bikes';
import { ECUS } from '../../data/ecu';
import { useActiveBike, useStore } from '../../store';

const APPS: [string, string][] = [
  ['Yamaha', 'Power Tuner – Wi-Fi, bränsle/tändning 4×4, TC & launch (2023+), live-data, felkoder'],
  ['KTM / Husqvarna', 'KTMconnect + Connectivity Unit Offroad (2023+) – gassvar, motorbroms, TC, launch'],
  ['Kawasaki', 'Rideology The App KX – bränsle/tändning trådlöst (nyare KX)'],
  ['Suzuki', 'MX-Tuner 2.0 – egna kartor till kontakten'],
  ['Honda', 'Ingen fabriksapp – lägen på styret, GET WiFi-COM + WiGET för finjustering'],
  ['Stark', 'Hela inställningen i Stark-appen på cykelns telefon'],
];

export default function Engine() {
  const { state } = useStore();
  const bike = useActiveBike();
  const model = bike ? findModel(bike.modelId) : undefined;
  const ecuId = model && bike ? genFor(model, bike.year).ecu : undefined;
  const ecu = ecuId ? ECUS[ecuId] : undefined;
  const maps = state.maps.filter((m) => !bike || m.bikeId === bike.id || m.ecu === ecuId);
  const others = state.maps.filter((m) => !maps.includes(m));

  return (
    <Screen>
      {ecu && model && bike ? (
        <Card title={ecu.title}>
          <T dim size={13}>{model.brand} {model.name} {bike.year}</T>
          {ecu.tool ? <T><T bold>Verktyg: </T>{ecu.tool}</T> : null}
          <T>{ecu.summary}</T>
          {ecu.steps.map((x, i) => <T key={i} dim size={14}>{i + 1}. {x}</T>)}
          <Btn title={ecu.grid ? '+ Ny mapp' : '+ Spara inställning'} onPress={() => router.push({ pathname: '/map/[id]', params: { id: 'new' } })} />
        </Card>
      ) : (
        <Card title="Ingen cykel vald">
          <T dim>Lägg till din cykel i Garaget så visas vad den kan mappas med.</T>
        </Card>
      )}

      <Card title="Mina mappar" right={<Btn small kind="ghost" title="Importera" onPress={() => router.push('/import')} />}>
        {maps.length === 0 ? <T dim>Inga sparade mappar än. Skapa en ovan eller importera från en kompis (QR-kod/länk/fil).</T> : null}
        {maps.map((m) => <MapRow key={m.id} id={m.id} name={m.name} sub={`${m.model ?? ''}${m.author ? ` · av ${m.author}` : ''}`} />)}
        {others.length > 0 ? <T dim size={13}>Andra cyklar</T> : null}
        {others.map((m) => <MapRow key={m.id} id={m.id} name={m.name} sub={m.model ?? ''} />)}
      </Card>

      <Card title="Tillverkarnas appar">
        {APPS.map(([b, t]) => (
          <View key={b}>
            <T bold>{b}</T>
            <T dim size={14}>{t}</T>
          </View>
        ))}
        <T dim size={12}>DialedMX kan inte skriva direkt till styrenheten – tillverkarnas protokoll och kartfiler är låsta/krypterade. Här skapar, sparar och delar du mappar, och för sedan över värdena i tillverkarens app (det tar under en minut).</T>
      </Card>
    </Screen>
  );
}

function MapRow({ id, name, sub }: { id: string; name: string; sub: string }) {
  return (
    <Pressable onPress={() => router.push({ pathname: '/map/[id]', params: { id } })} style={{ borderWidth: 1, borderColor: C.line, borderRadius: 10, padding: 10 }}>
      <Row>
        <View style={{ flex: 1 }}>
          <T bold>{name}</T>
          {sub ? <T dim size={13}>{sub}</T> : null}
        </View>
        <T color={C.accent}>›</T>
      </Row>
    </Pressable>
  );
}
