import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Btn, C, Card, Chips, Row, Screen, T, str } from '../components/ui';
import { findModel } from '../data/bikes';
import { GUIDES, MAKERS, forkMaker, shockMaker, type Maker } from '../data/clickers';
import { useActiveBike } from '../store';

export default function Standard() {
  const bike = useActiveBike();
  const model = bike ? findModel(bike.modelId) : undefined;
  const fm = bike ? forkMaker(bike.fork) : undefined;
  const sm = bike ? shockMaker(bike.shock) : undefined;
  const [maker, setMaker] = useState<Maker>(fm ?? sm ?? 'KYB');
  const g = GUIDES[maker];
  const st = bike?.stock ?? {};
  const known = [st.forkComp, st.forkReb, st.shockLsc, st.shockHsc, st.shockReb].some((v) => v != null);

  return (
    <Screen>
      <Card>
        <T>Alla klickråd i MXEX räknas från standardläget. Så här ställer du tillbaka fjädringen till standard:</T>
        {model && bike ? (
          <T dim size={13}>
            Din {model.brand} {model.name} {bike.year}: gaffel {fm ?? 'okänd'}, stötdämpare {sm ?? 'okänd'}.
            {fm && sm && fm !== sm ? ' Olika tillverkare fram och bak – kolla båda flikarna.' : ''}
          </T>
        ) : null}
        <Chips options={MAKERS} value={maker} onChange={setMaker} />
        <T dim size={12}>{g.bikes}</T>
      </Card>

      <Card title="Steg för steg">
        <Step n={1} text={known ? 'Dina standardvärden (från Garaget):' : 'Leta upp standardvärdena i instruktionsboken, under fjädringsinställningar.'} />
        {known ? (
          <View style={{ marginLeft: 30, gap: 2 }}>
            {st.forkComp != null ? <T size={14}>Gaffel kompression: {str(st.forkComp)} klick ut</T> : null}
            {st.forkReb != null ? <T size={14}>Gaffel retur: {str(st.forkReb)} klick ut</T> : null}
            {st.shockLsc != null ? <T size={14}>Stöt lågfart-komp.: {str(st.shockLsc)} klick ut</T> : null}
            {st.shockHsc != null ? <T size={14}>Stöt höghast.-komp.: {str(st.shockHsc)} varv ut</T> : null}
            {st.shockReb != null ? <T size={14}>Stöt retur: {str(st.shockReb)} klick ut</T> : null}
          </View>
        ) : null}
        <Step n={2} text={g.zero} />
        <Step n={3} text={g.count} />
        <Step n={4} text="Gör likadant på varje justerare. Skriv gärna upp vad du hade innan, så kan du gå tillbaka." />
      </Card>

      <Card title={`Var sitter justerarna (${maker})?`}>
        {g.where.map((w) => (
          <View key={w.name}>
            <T bold size={14}>{w.name}</T>
            <T dim size={14}>{w.place}</T>
          </View>
        ))}
      </Card>

      <Card title="Bra att veta">
        {g.tips.map((t, i) => <T key={i} size={14}>• {t}</T>)}
        <T dim size={12}>Källa: {g.source}</T>
      </Card>

      {bike && !known ? (
        <Btn kind="ghost" title="Fyll i dina standardvärden i Garaget" onPress={() => router.push(`/bike/${bike.id}`)} />
      ) : null}
    </Screen>
  );
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <Row>
      <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' }}>
        <T bold size={13} color="#000">{n}</T>
      </View>
      <T size={15} style={{ flex: 1 }}>{text}</T>
    </Row>
  );
}
