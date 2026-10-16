import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import { Btn, Card, Chips, Field, Row, Screen, Select, T, num, str } from '../../components/ui';
import { BRANDS, FORKS, SHOCKS, findModel, genFor, modelsFor, yearsFor, type ForkId, type ShockId } from '../../data/bikes';
import { servicesFor, uid, useStore, type Bike } from '../../store';

export default function EditBike() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, update } = useStore();
  const existing = state.bikes.find((b) => b.id === id);
  const existingModel = existing ? findModel(existing.modelId) : undefined;

  const [brand, setBrand] = useState<string | undefined>(existingModel?.brand);
  const [year, setYear] = useState<number | undefined>(existing?.year);
  const [bike, setBike] = useState<Partial<Bike>>(existing ?? { stock: {}, hours: 0 });
  const set = (p: Partial<Bike>) => setBike((b) => ({ ...b, ...p }));

  const model = bike.modelId ? findModel(bike.modelId) : undefined;
  const gen = model && year ? genFor(model, year) : undefined;
  const air = bike.fork ? FORKS[bike.fork].air : false;

  const pickModel = (modelId: string, y = year) => {
    const m = findModel(modelId);
    if (!m || !y) return set({ modelId });
    const gn = genFor(m, y);
    set({ modelId, fork: gn.fork, shock: gn.shock });
  };

  const save = () => {
    if (!model || !year || !bike.fork || !bike.shock) {
      if (Platform.OS === 'web') window.alert('Välj märke, år och modell.');
      else Alert.alert('Saknas', 'Välj märke, år och modell.');
      return;
    }
    const full: Bike = {
      id: existing?.id ?? uid(),
      modelId: model.id,
      year,
      nickname: bike.nickname,
      fork: bike.fork,
      shock: bike.shock,
      forkSpring: bike.forkSpring,
      shockSpring: bike.shockSpring,
      airBar: bike.airBar,
      springsChanged: bike.springsChanged,
      stock: bike.stock ?? {},
      hours: bike.hours ?? 0,
    };
    update((s) => {
      const bikes = existing ? s.bikes.map((b) => (b.id === full.id ? full : b)) : [...s.bikes, full];
      // Ny cykel, eller bytt modell/år → hämta tillverkarens serviceschema.
      const changed = !existing || existing.modelId !== full.modelId || existing.year !== full.year;
      const services = changed ? [...s.services.filter((x) => x.bikeId !== full.id), ...servicesFor(full)] : s.services;
      return { ...s, bikes, services, activeBikeId: full.id };
    });
    router.back();
  };

  const remove = () => {
    const doIt = () => {
      update((s) => ({ ...s, bikes: s.bikes.filter((b) => b.id !== id), services: s.services.filter((x) => x.bikeId !== id), serviceLog: s.serviceLog.filter((x) => x.bikeId !== id) }));
      router.back();
    };
    if (Platform.OS === 'web') { if (window.confirm('Ta bort cykeln?')) doIt(); }
    else Alert.alert('Ta bort cykeln?', '', [{ text: 'Avbryt' }, { text: 'Ta bort', style: 'destructive', onPress: doIt }]);
  };

  const stock = bike.stock ?? {};
  const setStock = (k: keyof NonNullable<Bike['stock']>, v: string) => set({ stock: { ...stock, [k]: num(v) } });

  return (
    <Screen>
      <Card title="Cykel">
        <Select
          label="Märke"
          value={brand}
          options={BRANDS.map((b) => ({ value: b, label: b }))}
          onChange={(b) => { setBrand(b); set({ modelId: undefined }); setYear(undefined); }}
          placeholder="Sök märke, t.ex. Yamaha"
        />
        <Row>
          <Select
            label="Årsmodell"
            value={year}
            options={brand ? yearsFor(brand).map((y) => ({ value: y, label: String(y) })) : []}
            onChange={(y) => { setYear(y); if (bike.modelId) { const ok = modelsFor(brand!, y).some((m) => m.id === bike.modelId); if (ok) pickModel(bike.modelId, y); else set({ modelId: undefined }); } }}
            placeholder={brand ? 'Välj år' : 'Välj märke först'}
          />
          <Select
            label="Modell"
            value={bike.modelId}
            options={brand ? modelsFor(brand, year).map((m) => ({ value: m.id, label: m.name, sub: m.use === 'mx' ? 'Motocross' : 'Enduro/cross-country' })) : []}
            onChange={(v) => pickModel(v)}
            placeholder={brand ? 'Välj modell' : '—'}
          />
        </Row>
        <Row>
          <Field label="Smeknamn (valfritt)" value={bike.nickname ?? ''} onChange={(v) => set({ nickname: v || undefined })} />
          <View style={{ width: 130 }}>
            <Field label="Motortimmar nu" numeric value={str(bike.hours)} onChange={(v) => set({ hours: num(v) ?? 0 })} />
          </View>
        </Row>
      </Card>

      {model && gen ? (
        <Card title="Fjädring">
          <T dim size={13}>Förifyllt utifrån modell och år – ändra om din cykel är ombyggd.</T>
          <Select label="Gaffel" value={bike.fork} searchable={false} options={(Object.keys(FORKS) as ForkId[]).map((f) => ({ value: f, label: FORKS[f].name }))} onChange={(v) => set({ fork: v })} />
          <Select label="Stötdämpare" value={bike.shock} searchable={false} options={(Object.keys(SHOCKS) as ShockId[]).map((f) => ({ value: f, label: SHOCKS[f] }))} onChange={(v) => set({ shock: v })} />
          <T dim size={13}>Har du bytt fjädrar?</T>
          <Chips options={['Nej, standard', 'Ja, bytta']} value={bike.springsChanged ? 'Ja, bytta' : 'Nej, standard'} onChange={(v) => set({ springsChanged: v === 'Ja, bytta' })} />
          <Row>
            {air ? (
              <Field label="Standardtryck enligt manualen (bar)" numeric value={str(bike.airBar)} onChange={(v) => set({ airBar: num(v) })} placeholder={gen.airBar ? str(gen.airBar) : undefined} />
            ) : (
              <Field label="Gaffelfjäder (N/mm)" numeric value={str(bike.forkSpring)} onChange={(v) => set({ forkSpring: num(v) })} placeholder={gen.forkSpring ? str(gen.forkSpring) : 't.ex. 4,6'} />
            )}
            <Field label="Stötdämparfjäder (N/mm)" numeric value={str(bike.shockSpring)} onChange={(v) => set({ shockSpring: num(v) })} placeholder={gen.shockSpring ? str(gen.shockSpring) : 't.ex. 55'} />
          </Row>
          <T dim size={12}>Lämna tomt om du inte vet – då används typvärden för klassen. Fjäderhårdheten står ofta stämplad på fjädern (t.ex. 5.6 = 5,6 kg/mm ≈ 55 N/mm).</T>
        </Card>
      ) : null}

      {model ? (
        <Card title="Standardklick (från instruktionsboken)">
          <T dim size={13}>Valfritt. Anges som klick UT från helt stängt (medurs i botten). Med detta visar appen exakta klick i stället för 2 klick hårdare.</T>
          <Row>
            <Field label="Gaffel komp." numeric value={str(stock.forkComp)} onChange={(v) => setStock('forkComp', v)} />
            <Field label="Gaffel retur" numeric value={str(stock.forkReb)} onChange={(v) => setStock('forkReb', v)} />
          </Row>
          <Row>
            <Field label="Stöt LS-komp." numeric value={str(stock.shockLsc)} onChange={(v) => setStock('shockLsc', v)} />
            <Field label="Stöt HS-komp. (varv)" numeric value={str(stock.shockHsc)} onChange={(v) => setStock('shockHsc', v)} />
            <Field label="Stöt retur" numeric value={str(stock.shockReb)} onChange={(v) => setStock('shockReb', v)} />
          </Row>
        </Card>
      ) : null}

      <Btn title="Spara" onPress={save} />
      {existing ? <Btn kind="danger" title="Ta bort cykel" onPress={remove} /> : null}
    </Screen>
  );
}
