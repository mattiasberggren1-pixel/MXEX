import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, Text, View } from 'react-native';
import { Btn, C, Card, Field, Row, Screen, T, num, str } from '../../components/ui';
import { findModel } from '../../data/bikes';
import { oilFor, serviceTemplate } from '../../data/service';
import { dueOf, servicesFor, uid, useStore, type Bike, type Service } from '../../store';

const OIL_KEYS = ['oil', 'oilfilter', 'gearoil'];
const h1 = (n: number) => str(Math.round(n * 10) / 10);

export default function ServiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, update } = useStore();
  const bike = state.bikes.find((b) => b.id === id);
  const [open, setOpen] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [edit, setEdit] = useState(false);
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (!bike?.rideStart) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [bike?.rideStart]);

  const model = bike ? findModel(bike.modelId) : undefined;
  if (!bike || !model) return <Screen><T dim>Cykeln finns inte.</T></Screen>;

  const tmpl = serviceTemplate(model, bike.year);
  const oil = oilFor(model);
  const items = state.services.filter((x) => x.bikeId === bike.id);
  const legacy = items.length > 0 && items.every((x) => !x.key);
  const log = state.serviceLog.filter((x) => x.bikeId === bike.id);

  const setBike = (p: Partial<Bike>) => update((s) => ({ ...s, bikes: s.bikes.map((b) => (b.id === bike.id ? { ...b, ...p } : b)) }));
  const setHours = (h: number) => setBike({ hours: Math.max(0, Math.round(h * 10) / 10) });
  const setItem = (sid: string, p: Partial<Service>) => update((s) => ({ ...s, services: s.services.map((x) => (x.id === sid ? { ...x, ...p } : x)) }));
  const resetSchedule = () => update((s) => ({ ...s, services: [...s.services.filter((x) => x.bikeId !== bike.id), ...servicesFor(bike)] }));

  const startRide = () => setBike({ rideStart: Date.now() });
  const stopRide = () => {
    if (!bike.rideStart) return;
    const h = (Date.now() - bike.rideStart) / 3.6e6;
    const add = () => setBike({ rideStart: undefined, hours: Math.round((bike.hours + h) * 10) / 10 });
    if (h <= 4) return add();
    // Glömd timer? Fråga innan orimligt många timmar läggs till.
    const msg = `Körningen blev ${h1(h)} h. Lägga till alla?`;
    if (Platform.OS === 'web') { if (window.confirm(msg)) add(); else setBike({ rideStart: undefined }); }
    else Alert.alert('Lång körning', msg, [{ text: 'Nej', onPress: () => setBike({ rideStart: undefined }) }, { text: 'Ja', onPress: add }]);
  };

  const markDone = (x: Service) => {
    update((s) => ({
      ...s,
      services: s.services.map((y) => (y.id === x.id ? { ...y, lastH: bike.hours, lastDate: Date.now(), done: y.once ? true : y.done } : y)),
      serviceLog: [{ id: uid(), bikeId: bike.id, name: x.name, date: Date.now(), hours: bike.hours }, ...s.serviceLog],
    }));
    setOpen(null);
  };

  const withDue = items.map((x) => ({ x, d: dueOf(x, bike.hours) })).filter((e) => e.d.level !== 'done');
  const rank = (e: (typeof withDue)[number]) => Math.min(e.d.left ?? 1e9, e.d.daysLeft != null ? e.d.daysLeft / 7 : 1e9);
  withDue.sort((a, b) => rank(a) - rank(b));
  const todo = withDue.filter((e) => e.d.level !== 'ok');
  const later = withDue.filter((e) => e.d.level === 'ok');
  const shownLater = showAll ? later : later.slice(0, 4);

  const rideMin = bike.rideStart && now > bike.rideStart ? Math.floor((now - bike.rideStart) / 60000) : 0;

  const row = ({ x, d }: (typeof withDue)[number]) => {
    const isOpen = open === x.id;
    const color = d.level === 'over' ? C.bad : d.level === 'soon' ? C.warn : C.good;
    const status =
      d.left != null
        ? d.left <= 0 ? `${h1(-d.left)} h över` : `${h1(d.left)} h kvar`
        : d.daysLeft != null ? (d.daysLeft <= 0 ? 'Dags nu' : `om ${d.daysLeft} dagar`) : '';
    const frac = x.intervalH && d.left != null ? Math.min(1, Math.max(0, 1 - d.left / x.intervalH)) : 0;
    return (
      <Pressable key={x.id} onPress={() => setOpen(isOpen ? null : x.id)} style={{ borderWidth: 1, borderColor: isOpen ? C.accent : C.line, borderRadius: 12, padding: 12, gap: 8 }}>
        <Row>
          <View style={{ flex: 1 }}>
            <T bold>{x.name}</T>
            <T dim size={12}>
              {[x.intervalH ? (x.once ? `vid ${h1(x.intervalH)} h` : `var ${h1(x.intervalH)}:e h`) : null, x.months ? `var ${x.months}:e mån` : null].filter(Boolean).join(' eller ')}
              {x.src === 'praxis' ? ' · praxis' : x.src === 'tillverkare' ? ' · tillverkaren' : ''}
            </T>
          </View>
          <T bold color={color}>{status}</T>
        </Row>
        {x.intervalH && !x.once ? (
          <View style={{ height: 6, backgroundColor: '#11141a', borderRadius: 3 }}>
            <View style={{ width: `${frac * 100}%`, height: 6, backgroundColor: color, borderRadius: 3 }} />
          </View>
        ) : null}
        {isOpen ? (
          <View style={{ gap: 8 }}>
            {x.what ? <T size={14}>{x.what}</T> : null}
            {OIL_KEYS.includes(x.key ?? '') || x.key?.startsWith('ktm-') ? (
              <View style={{ backgroundColor: '#11141a', borderRadius: 10, padding: 10 }}>
                <T bold size={14}>{oil.what}: {oil.grade}</T>
                <T dim size={13}>T.ex. {oil.example}{oil.qty ? ` · ${oil.qty}` : ''}</T>
              </View>
            ) : null}
            {edit ? (
              <Row>
                <Field label="Intervall (h)" numeric value={str(x.intervalH)} onChange={(v) => setItem(x.id, { intervalH: num(v) })} />
                <Field label="Senast vid (h)" numeric value={str(x.lastH)} onChange={(v) => setItem(x.id, { lastH: num(v) ?? 0 })} />
              </Row>
            ) : null}
            <Pressable onPress={() => markDone(x)} style={({ pressed }) => ({ backgroundColor: C.good, borderRadius: 12, paddingVertical: 14, alignItems: 'center', opacity: pressed ? 0.7 : 1 })}>
              <Text style={{ color: '#000', fontWeight: '800', fontSize: 17 }}>✓ Klart nu</Text>
            </Pressable>
            {x.intervalH && !x.once ? <T dim size={12} style={{ textAlign: 'center' }}>Nästa gång vid {h1(bike.hours + x.intervalH)} h</T> : null}
          </View>
        ) : null}
      </Pressable>
    );
  };

  return (
    <Screen>
      <Card>
        <T dim size={13}>{bike.nickname || `${model.brand} ${model.name}`} {bike.year}</T>
        <Row>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.text, fontSize: 44, fontWeight: '800' }}>{h1(bike.hours)} h</Text>
            <T dim size={12}>motortimmar</T>
          </View>
          <View style={{ gap: 6 }}>
            <Btn small kind="ghost" title="+0,5 h" onPress={() => setHours(bike.hours + 0.5)} />
            <Btn small kind="ghost" title="+1 h" onPress={() => setHours(bike.hours + 1)} />
          </View>
        </Row>
        {bike.rideStart ? (
          <Pressable onPress={stopRide} style={{ backgroundColor: C.bad, borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}>
            <Text style={{ color: '#000', fontWeight: '800', fontSize: 17 }}>■ Stoppa körning ({Math.floor(rideMin / 60)}:{String(rideMin % 60).padStart(2, '0')})</Text>
          </Pressable>
        ) : (
          <Pressable onPress={startRide} style={{ backgroundColor: C.accent, borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}>
            <Text style={{ color: '#000', fontWeight: '800', fontSize: 17 }}>▶ Starta körning</Text>
          </Pressable>
        )}
        <T dim size={12}>Tryck Starta när du kör ut och Stoppa när du är klar – tiden läggs på motortimmarna även om du stänger appen under tiden.</T>
      </Card>

      {legacy ? (
        <Card title="Nytt serviceschema finns">
          <T dim size={14}>Byt till schemat för {model.brand} {model.name} {bike.year}.</T>
          <Btn title="Hämta tillverkarens schema" onPress={resetSchedule} />
        </Card>
      ) : null}

      {todo.length ? (
        <Card title="Att göra">
          {todo.map(row)}
        </Card>
      ) : (
        <Card><T color={C.good} bold>✓ Inget som behöver göras just nu</T></Card>
      )}

      <Card title="Kommande">
        {shownLater.map(row)}
        {later.length > 4 ? <Btn small kind="ghost" title={showAll ? 'Visa färre' : `Visa alla (${later.length})`} onPress={() => setShowAll(!showAll)} /> : null}
      </Card>

      <Card title="Servicelogg">
        {log.length === 0 ? <T dim size={14}>Det du markerar som klart hamnar här.</T> : null}
        {log.slice(0, 15).map((l) => (
          <Row key={l.id}>
            <T dim size={13} style={{ width: 82 }}>{new Date(l.date).toLocaleDateString('sv-SE')}</T>
            <T size={14} style={{ flex: 1 }}>{l.name}</T>
            <T dim size={13}>{h1(l.hours)} h</T>
          </Row>
        ))}
      </Card>

      <Card>
        <T dim size={12}>{tmpl.title}. Källa: {tmpl.source}</T>
        <T dim size={12}>Tillverkarna skiljer inte på nybörjare och elit – intervallen gäller timmar oavsett nivå. Kör du mycket i sand, lera eller damm: luftfilter efter varje körning och olja oftare.</T>
        <Row wrap>
          <Btn small kind="ghost" title={edit ? 'Klar med ändringar' : 'Anpassa intervall'} onPress={() => setEdit(!edit)} />
          {edit ? <Btn small kind="danger" title="Återställ schema" onPress={resetSchedule} /> : null}
        </Row>
      </Card>
    </Screen>
  );
}
