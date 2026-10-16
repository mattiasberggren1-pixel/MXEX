import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { FORKS, findModel } from '../../data/bikes';
import { Btn, C, Card, Chips, Field, Row, Screen, T, num, str } from '../../components/ui';
import { DISCIPLINES, SKILLS } from '../../logic/suspension';
import { useActiveBike, useStore } from '../../store';

export default function Garage() {
  const { state, update } = useStore();
  const active = useActiveBike();
  const r = state.rider;
  const setRider = (p: Partial<typeof r>) => update((s) => ({ ...s, rider: { ...s.rider, ...p } }));

  return (
    <Screen>
      <Card title="Förare">
        <View style={{ width: 200 }}>
          <Field label="Vikt utan utrustning (kg)" numeric value={str(r.weightKg)} onChange={(v) => setRider({ weightKg: num(v) ?? 0 })} />
        </View>
        <T dim size={13}>Nivå</T>
        <Chips options={SKILLS} value={r.skill} onChange={(v) => setRider({ skill: v })} />
        <T dim size={13}>Gren</T>
        <Chips options={DISCIPLINES} value={r.discipline} onChange={(v) => setRider({ discipline: v })} />
      </Card>

      <Card title="Mina cyklar" right={<Btn small title="+ Lägg till" onPress={() => router.push('/bike/new')} />}>
        {state.bikes.length === 0 && (
          <T dim>Lägg till din cykel för att få fjädrings- och mappningsråd. Välj märke, årsmodell och modell – fjädringstypen fylls i automatiskt.</T>
        )}
        {state.bikes.map((b) => {
          const m = findModel(b.modelId);
          const on = active?.id === b.id;
          return (
            <Pressable
              key={b.id}
              onPress={() => update((s) => ({ ...s, activeBikeId: b.id }))}
              onLongPress={() => router.push(`/bike/${b.id}`)}
              style={{ borderWidth: 1, borderColor: on ? C.accent : C.line, borderRadius: 12, padding: 12, gap: 2 }}>
              <Row>
                <View style={{ flex: 1 }}>
                  <T bold size={17}>{b.nickname || `${m?.brand ?? ''} ${m?.name ?? ''}`} {b.year}</T>
                  <T dim size={13}>{FORKS[b.fork].name} · {b.hours} h</T>
                </View>
                {on ? <T color={C.accent} bold>Aktiv</T> : null}
                <Btn small kind="ghost" title="Ändra" onPress={() => router.push(`/bike/${b.id}`)} />
              </Row>
            </Pressable>
          );
        })}
      </Card>

      <Card title="Så funkar det">
        <T dim size={14}>1. Fyll i vikt och nivå. 2. Lägg till cykeln. 3. Fliken Fjädring ger fjädrar, sag och klick för dagens underlag. 4. Fliken Motor visar vad din cykel kan mappas med och låter dig spara och dela mappar via QR-kod eller länk.</T>
      </Card>
    </Screen>
  );
}
