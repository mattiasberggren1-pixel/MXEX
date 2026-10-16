import { router } from 'expo-router';
import { useState } from 'react';
import { Btn, C, Card, Chips, Field, Row, Screen, Stat, T, num, str } from '../../components/ui';
import { FORKS, findModel, genFor } from '../../data/bikes';
import {
  TERRAINS, absClicks, analyzeSag, clickText, clickerRec, kg, rebText, sagTarget, springRec, type Terrain,
} from '../../logic/suspension';
import { uid, useActiveBike, useStore } from '../../store';

export default function Suspension() {
  const { state, update } = useStore();
  const bike = useActiveBike();
  const [terrain, setTerrain] = useState<Terrain>('blandat');
  const [r1, setR1] = useState('');
  const [r2, setR2] = useState('');
  const [r3, setR3] = useState('');

  const model = bike ? findModel(bike.modelId) : undefined;
  if (!bike || !model) {
    return (
      <Screen>
        <Card title="Ingen cykel vald">
          <T dim>Lägg till din cykel i Garaget först.</T>
          <Btn title="Lägg till cykel" onPress={() => router.push('/bike/new')} />
        </Card>
      </Screen>
    );
  }

  const gen = genFor(model, bike.year);
  const rider = state.rider;
  const spring = springRec(model, rider, bike.fork, {
    forkSpring: bike.forkSpring ?? gen.forkSpring,
    shockSpring: bike.shockSpring ?? gen.shockSpring,
    airBar: bike.airBar ?? gen.airBar, // bike.airBar = standardtryck enligt manualen
  });
  const target = sagTarget(model);
  const cl = clickerRec(rider, terrain, spring, !bike.springsChanged);
  const sag = [num(r1), num(r2), num(r3)].every((x) => x != null) ? analyzeSag(num(r1)!, num(r2)!, num(r3)!, target) : null;
  const st = bike.stock;
  const air = FORKS[bike.fork].air;
  const airBase = spring.airRec;
  const airLine = airBase != null
    ? `Lufttryck: ${(airBase + cl.airDelta).toFixed(1)} bar`
    : `Lufttryck: standard ${(spring.airDelta! + cl.airDelta) >= 0 ? '+' : ''}${(spring.airDelta! + cl.airDelta).toFixed(1)} bar`;

  const setupText = [
    air ? airLine : null,
    `Gaffel komp: ${clickText(cl.forkComp)}${absClicks(st.forkComp, cl.forkComp)}`,
    `Gaffel retur: ${rebText(cl.forkReb)}${absClicks(st.forkReb, cl.forkReb)}`,
    `Stöt LS: ${clickText(cl.shockLsc)}${absClicks(st.shockLsc, cl.shockLsc)}`,
    `Stöt HS: ${clickText(cl.shockHsc, 'varv')}${absClicks(st.shockHsc, cl.shockHsc)}`,
    `Stöt retur: ${rebText(cl.shockReb)}${absClicks(st.shockReb, cl.shockReb)}`,
    `Racesag ${target.race[0]}–${target.race[1]} mm, däck ${cl.tyres[0]}/${cl.tyres[1]} bar`,
  ].filter(Boolean).join('\n');

  const saveToLog = () => {
    update((s) => ({
      ...s,
      logs: [{ id: uid(), bikeId: bike.id, date: Date.now(), track: '', terrain, setup: setupText, rating: 3, notes: '' }, ...s.logs],
    }));
    router.push('/log');
  };

  return (
    <Screen>
      <T dim size={13}>{model.brand} {model.name} {bike.year} · {FORKS[bike.fork].name} · {rider.weightKg} kg, {rider.skill}, {rider.discipline}</T>

      <Card title="Fjädrar för din vikt">
        <Row wrap>
          {air ? (
            spring.airRec != null ? (
              <Stat label="Lufttryck gaffel" value={`${str(spring.airRec)} bar`} sub={`std ${str(spring.airStock)} bar`} color={C.accent} />
            ) : (
              <Stat label="Lufttryck gaffel" value={`${spring.airDelta! >= 0 ? '+' : ''}${str(spring.airDelta)} bar`} sub="jämfört med manualens standardtryck" color={C.accent} />
            )
          ) : (
            <Stat label="Gaffelfjäder (per ben)" value={`${str(spring.forkRec)} N/mm`} sub={`${kg(spring.forkRec!)} kg/mm · std ${str(spring.forkStock)}`} color={C.accent} />
          )}
          <Stat label="Stötdämparfjäder" value={`${spring.shockRec} N/mm`} sub={`${kg(spring.shockRec)} kg/mm · std ${spring.shockStock}`} color={C.accent} />
        </Row>
        {!air && spring.forkVerdict ? <T>Gaffel: {spring.forkVerdict}</T> : null}
        <T>Stötdämpare: {spring.shockVerdict}</T>
        <T dim size={12}>Riktvärde utifrån vikt, nivå och gren (standardfjädrar är gjorda för ca {spring.ref} kg). Fjäderhårdhet beror också på länkage – stäm av med din fjädringsverkstad innan du köper fjädrar.</T>
      </Card>

      <Card title="Underlag idag">
        <Chips options={TERRAINS.map((t) => t.id)} labels={Object.fromEntries(TERRAINS.map((t) => [t.id, t.label]))} value={terrain} onChange={setTerrain} />
      </Card>

      <Card title="Klickrar (från standardläget)">
        {air ? <T bold>{airLine}{cl.airDelta ? ` (inkl. ${cl.airDelta > 0 ? '+' : ''}${str(cl.airDelta)} för underlaget)` : ''}</T> : null}
        <Line label="Gaffel kompression" v={clickText(cl.forkComp) + absClicks(st.forkComp, cl.forkComp)} />
        <Line label="Gaffel retur" v={rebText(cl.forkReb) + absClicks(st.forkReb, cl.forkReb)} />
        <Line label="Stöt lågfarts-komp." v={clickText(cl.shockLsc) + absClicks(st.shockLsc, cl.shockLsc)} />
        <Line label="Stöt höghast.-komp." v={clickText(cl.shockHsc, 'varv') + absClicks(st.shockHsc, cl.shockHsc)} />
        <Line label="Stöt retur" v={rebText(cl.shockReb) + absClicks(st.shockReb, cl.shockReb)} />
        <Line label="Gaffelrör i kronan" v={cl.forkHeight === 0 ? 'Standard' : cl.forkHeight > 0 ? `${cl.forkHeight} mm upp (snabbare styrning)` : `${-cl.forkHeight} mm ner (stabilare)`} />
        <Line label="Däcktryck fram/bak" v={`${str(cl.tyres[0])} / ${str(cl.tyres[1])} bar`} />
        {cl.notes.map((n, i) => <T key={i} dim size={13}>• {n}</T>)}
        {!st.forkComp && !st.shockLsc ? <T dim size={12}>Tips: fyll i standardklicken under cykeln i Garaget så visas exakta värden.</T> : null}
        <Row>
          <Btn small title="Spara i loggen" onPress={saveToLog} />
          <Btn small kind="ghost" title="Felsök ett problem" onPress={() => router.push('/troubleshoot')} />
        </Row>
      </Card>

      <Card title="Sag">
        <Row wrap>
          <Stat label="Racesag (med förare)" value={`${target.race[0]}–${target.race[1]} mm`} />
          <Stat label="Statisk sag (utan förare)" value={`${target.static[0]}–${target.static[1]} mm`} />
        </Row>
        <T dim size={13}>Mät från bakaxeln rakt upp till en fast punkt på bakskärmen:</T>
        <Row>
          <Field label="R1 hjulet i luften" numeric value={r1} onChange={setR1} placeholder="mm" />
          <Field label="R2 på marken" numeric value={r2} onChange={setR2} placeholder="mm" />
          <Field label="R3 med förare" numeric value={r3} onChange={setR3} placeholder="mm" />
        </Row>
        {sag ? (
          <>
            <Row wrap>
              <Stat label="Din racesag" value={`${sag.race} mm`} color={sag.race >= target.race[0] && sag.race <= target.race[1] ? C.good : C.warn} />
              <Stat label="Din statiska sag" value={`${sag.static} mm`} color={sag.static >= target.static[0] && sag.static <= target.static[1] ? C.good : C.warn} />
            </Row>
            {sag.advice.map((a, i) => <T key={i}>• {a}</T>)}
          </>
        ) : null}
      </Card>
    </Screen>
  );
}

function Line({ label, v }: { label: string; v: string }) {
  return (
    <Row>
      <T dim style={{ flex: 1 }}>{label}</T>
      <T bold style={{ flexShrink: 1, textAlign: 'right' }}>{v}</T>
    </Row>
  );
}
